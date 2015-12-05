"use strict"

var _ = require( 'lodash' )
var uuid = require( 'node-uuid' )

module.exports = function( options ) {
  var entities = this.export( 'constants/entities' )

  function update_data( args, done ) {
    var mite_id = args.mite_id
    var web_api = args.web_api

    entities.getEntity( 'api_doc', this ).load$( {mite_id: mite_id}, function( err, api_doc ) {
      if( err ) {
        return done( err )
      }

      if( !api_doc ) {
        api_doc = entities.getEntity( 'api_doc', this, {
          mite_id: mite_id
        } )
      }

      api_doc.data = api_doc.data || {}

      for( var i in web_api.data ) {
        var url = web_api.data[i].url
        if( url.indexOf( "/" ) != 0 ) {
          continue
        }
        var url_tokens = url.split( '/' )

        var data = api_doc.data

        var level = 0
        while( url_tokens.length > 0 ) {
          if( url_tokens[0].length == 0 ) {
            url_tokens.splice( 0, 1 )
            continue
          }

          var key = "/" + url_tokens[0]
          if( level >= 1 ) {
            key = ""
            for( var j in url_tokens ) {
              key = key + "/" + url_tokens[j]
            }
            url_tokens = []
          }

          data[key] = data[key] || {}

          data = data[key]

          if( level >= 1 ) {
            break
          }

          level++
          url_tokens.splice( 0, 1 )
        }
        data.info = data.info || {
          id: uuid()
        }
        data.info.method = data.info.method || {}
        data.info.method[web_api.data[i].method] = data.info.method[web_api.data[i].method] || {}

        data.info.url = web_api.data[i].url
      }

      delete api_doc.data.info
      api_doc.save$( done )
    } )
  }

  function update_api( args, done ) {
    var mite_id = args.mite_id
    var urlConfig = args.urlConfig
    var operation_data = args.operation_data

    entities.getEntity( 'api_doc', this ).load$( {mite_id: mite_id}, function( err, api_doc ) {
      if( err ) {
        return done( err )
      }
      if( !api_doc ) {
        return done()
      }

      if( !api_doc.data ) {
        return done()
      }

      for( var i in api_doc.data ) {
        var data = api_doc.data[i]

        for( var j in data ) {
          if( j === 'info' ) {
            if( data[j].url === urlConfig.url ) {
              // I found it
              add_operation_data( data[j], operation_data, urlConfig )
              return api_doc.save$( done )
            }
          }
          else if ( data[j].info && data[j].info.url === urlConfig.url ){
            // I found it
            add_operation_data( data[j], operation_data, urlConfig )
            return api_doc.save$( done )
          }
        }
      }
      done()
    } )
  }

  function add_operation_data( data, operation_data, urlConfig ){
    var api = data.info
    for (var i in api.method){
      if (i === urlConfig.method){
        api = api.method[i]
        api.require_authorization = urlConfig.authorized || false
        if (!api.response){
          api.response = {}
        }
        if (!api.request){
          api.request = {}
        }

        if (!api.response.schema){
          api.response.schema = []
        }
        if (urlConfig.validate_response){
          var found = false
          for (var i in api.response.schema){
            if ( _.isEqual(api.response.schema[i], urlConfig.validate_response)){
              found = true
              break
            }
          }
          if (!found){
            api.response.schema.push(urlConfig.validate_response)
          }
        }

        if (operation_data.request && operation_data.request.body){
          if (!api.request.body){
            api.request.body = []
          }
          var found = false
          for (var i in api.request.body){
            if ( _.isEqual(api.request.body[i], operation_data.request.body)){
              found = true
              break
            }
          }
          if (!found){
            api.request.body.push(operation_data.request.body)
          }
        }

        if (operation_data.response && operation_data.response.body){
          if (!api.response){
            api.response.body = operation_data.response
          }
        }
        api.response.expectedStatus = operation_data.statusCode
        api.monitor = true
        return
      }
    }
  }


  this
    .add( {role: 'documentation', update: 'data'}, update_data )
    .add( {role: 'documentation', update: 'api'}, update_api )
}