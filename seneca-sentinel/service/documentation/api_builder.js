"use strict"

var _ = require( 'lodash' )
var uuid = require('node-uuid')

module.exports = function ( options ) {
  var seneca = this;

  var entities = seneca.export( 'constants/entities' )

  function update_data( args, done ) {
    var mite_id = args.mite_id
    var web_api = args.web_api

    entities.getEntity( 'api_doc', seneca ).load$( {mite_id: mite_id}, function ( err, api_doc ) {
      if ( err ) {
        return done( err )
      }
      if ( !api_doc ) {
        api_doc = entities.getEntity( 'api_doc', seneca, {
          mite_id: mite_id
        } )
      }

      if ( !api_doc.data ) {
        api_doc.data = {}
      }

      for ( var i in web_api.data ) {
        var url = web_api.data[i].url
        if ( url.indexOf( "/" ) != 0 ) {
          continue
        }
        var url_tokens = url.split( '/' )

        var data = api_doc.data

        var level = 0
        while ( url_tokens.length > 0 ) {
          if ( url_tokens[0].length == 0 ) {
            url_tokens.splice( 0, 1 )
            continue
          }

          var key = "/" + url_tokens[0]
          if ( level >= 1 ) {
            key = ""
            for (var j in url_tokens){
              key = key + "/" + url_tokens[j]
            }
            url_tokens = []
          }

          if ( !data[key] ) {
            data[key] = {
            }
          }
          data = data[key]

          if ( level >= 1 ) {
            break
          }

          level++
          url_tokens.splice( 0, 1 )
        }
        data.info = data.info || {
          id: uuid()
        }
        data.info.method = data.info.method || []

        if (_.indexOf(data.info.method, web_api.data[i].method ) === -1){
          data.info.method.push( web_api.data[i].method )
        }

        data.info.url = web_api.data[i].url
      }

      delete api_doc.data.info
      api_doc.save$( done )
    } )
  }

  seneca
    .add( {role: 'documentation', update: 'data'}, update_data )
}