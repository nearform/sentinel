"use strict"

var _ = require( 'lodash' )
var uuid = require( 'node-uuid' )
var async = require( 'async' )


module.exports = function( options ) {
  var seneca = this;

  var entities = seneca.export( 'constants/entities' )
  var mite_status = seneca.export( 'constants/mite_status' )

  var hist_data = {
    'load_1': true,
    'load_5': true,
    'load_15': true,
    'used_memory': true
  }

  function get_status( args, done ) {
    var mite = args.mite
    var communication_context = args.communication_context

    done( null, {
      authorization: {
        token: communication_context.auth_token
      },
      command: {
        type: 'getStatus'
      },
      payload: {
      }
    } )
  }


  function response_get_status( args, done ) {
    var response = args.response
    var mite = args.mite

    if( response.err ) {
      return done( null, { response: response, mite: mite } )
    }
    if( response.execution.err ) {
      return done( null, { err: true, code: response.execution.code, message: response.execution.msg} )
    }

    if( response.payload ) {
      mite.last_connect_time = new Date()

      //here I must save the status in a different collection
//      mite.process_status = mite.process_status || {}
//      if (response.payload.os && response.payload.os.length > 0){
//        mite.process_status.os = response.payload.os[response.payload.os.length - 1]
//        for (var i in mite.process_status.os.data){
//          console.log( mite.process_status.os.data[i] )
//          if (mite.process_status.os.data[i].data_type && 'memory_usage' === mite.process_status.os.data[i].data_type){
//            seneca.act("role: 'alarm', notify:'data'", { mite_id: mite.id, data: mite.process_status.os.data[i]}, function(){})
//          }
//        }
//      }
//
//      mite.process_status.seneca_stats = response.payload.seneca_stats
      mite.web_api = process_web_stats( response.payload.web_stats )

      saveSenecaStatus( response.payload.seneca_stats, function() {
      } )
//      saveWEBAPI( process_web_stats( response.payload.web_stats, function() {
//      } ) )
      async.eachLimit( response.payload.os, 10, saveOSStatus, function() {
      } )
    }

    done( null, { response: response, mite: mite } )


    function saveWEBAPI( status, done ) {
      status.mite_id = mite.id
      entities.getEntity( 'web_status', seneca, status ).save$( done )
    }


    function saveSenecaStatus( status, done ) {
      status.mite_id = mite.id
      entities.getEntity( 'seneca_status', seneca, status ).save$( done )
    }


    function saveOSStatus( status, done ) {
      status.mite_id = mite.id
      entities.getEntity( 'os_status', seneca, status ).save$( function() {
        if( status.data ) {
          for( var i in status.data ) {
            if( hist_data[status.data[i].data_type] ) {
              status.data[i].mite_id = mite.id
              status.data[i].date = new Date(status.timestamp)
              entities.getEntity( 'os_status_instant', seneca, status.data[i] ).save$(  )
            }
          }
        }
        done()
      } )
    }
  }

  function process_web_stats( web_stats ) {
    var stats = {
      data: []
    }

    stats.date = web_stats.date
    delete web_stats.date

    for( var key in web_stats ) {
      var data = key.split( ';' )
      var obj = {
        method: data[1],
        url: data[2],
        id: uuid()
      }
      obj = _.extend( obj, web_stats[key] )
      stats.data.push( obj )
    }

    return stats
  }


  seneca
    .add( {role: 'protocol_v1', generate: 'get_status'}, get_status )
    .add( {role: 'protocol_v1', process_response: 'get_status'}, response_get_status )
}