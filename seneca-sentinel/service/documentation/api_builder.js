"use strict"

var _ = require( 'lodash' )

module.exports = function( options ) {
  var seneca = this;

  var entities = seneca.export( 'constants/entities' )

  function update_data( args, done ) {
    var mite_id = args.mite_id
    var web_api = args.web_api

    entities.getEntity( 'api_doc', seneca ).load$( {mite_id: mite_id}, function( err, api_doc ) {
      if( err ) {
        return done( err )
      }
      if( !api_doc ) {
        api_doc = entities.getEntity( 'api_doc', seneca, {
          mite_id: mite_id
        } )

        if( !api_doc.data ) {
          api_doc.data = {}
        }

        for( var i in web_api.data ) {
          var url = web_api.data[i].url
          var url_tokens = url.split( '/' )

          var data = api_doc.data

          for( var j in url_tokens ) {
            if (!url_tokens[j] || url_tokens[j].length == 0){
              continue
            }

            if( !data[url_tokens[j]] ) {
              data[url_tokens[j]] = {}
            }
            data = data[url_tokens[j]]
          }
          data.method = web_api.data[i].method
          data.url = web_api.data[i].url
        }

        api_doc.save$( done )
      }
    } )
  }

  seneca
    .add( {role: 'documentation', update: 'data'}, update_data )
}