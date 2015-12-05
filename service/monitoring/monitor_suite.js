"use strict"

var _ = require( 'lodash' )
var async = require( 'async' )
var request = require( 'request' )
var uuid = require( 'node-uuid' )
var parambulator = require( 'parambulator' )

module.exports = function ( options ) {
  var entities = this.export( 'constants/entities' )
  var mite_status = this.export( 'constants/mite_status' )
  var monitor_context = {}
  var monitor_ids = {}

  function start_monitor() {
    entities.getEntity( 'mite', this ).list$( {}, function ( err, mites ) {
      if ( err ) {
        return
      }
      mites = mites || []

      _.each( mites, function ( mite ) {
        mite.suites = mite.suites || []
        _.each( mite.suites, function ( suite ) {
          verifyMonitorMiteSuite( mite, suite )
        } )
      } )
    } )
  }


  function verifyMonitorMiteSuite( mite, suite ) {
    if ( suite.monitoring ) {
      var interval = (suite.monitor_interval ? ( suite.monitor_interval || 60 * 10 ) : 60 * 10) * 1000

      monitor_ids['suite' + suite.id] = {
        started:    true,
        monitor_id: setInterval( function () {
          var suite_id = suite.id
          var mite_id = mite.id
          monitorSuite( mite_id, suite_id )
        }, interval ),
        mite_id:    mite.id,
        suite_id:   suite.id
      }
    }
    else {
      if ( monitor_ids['suite' + suite.id] ) {
        var monitor_id = monitor_ids['suite' + suite.id].monitor_id
        if ( monitor_id ) {
          clearInterval( monitor_id );
        }
        delete monitor_ids['suite' + suite.id]
      }
    }
  }


  function monitorSuite( mite_id, suite_id ) {
    entities.getEntity( 'mite', this ).load$( {id: mite_id}, function ( err, mite ) {
      if ( err ) {
        return
      }
      if ( !mite ) {
        return
      }

      for ( var i in mite.suites ) {
        if ( mite.suites[i].id === suite_id ) {
          this.act( "role: 'suite', cmd: 'run_once'", {mite: mite, suite: mite.suites[i]}, function ( err ) {
          } )
        }
      }
    } )
  }


  function verify_status( args, done ) {
    verifyMonitorMiteSuite( args.mite, args.suite )
    done()
  }


  start_monitor()

  this.add( {role: 'suite', cmd: 'verify_status'}, verify_status )
}