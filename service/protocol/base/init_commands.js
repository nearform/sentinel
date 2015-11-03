"use strict"

module.exports = function( options ) {
  var seneca = this;
  var name = 'protocol'

  var entities = seneca.export( 'constants/entities' )
  var mite_status = seneca.export( 'constants/mite_status' )


  function identify( args, done ) {
    var mite = args.mite

    done( null, {
      authorization: {},
      command: {
        type: 'identify'
      },
      payload: {
      }
    } )
  }


  function response_identify( args, done ) {
    var response = args.response
    var mite = args.mite

    if( response.err ) {
      return done( null, { response: response, mite: mite } )
    }

    if( response.payload ) {
      mite.protocol_version = response.payload.protocol_version || 1
      mite.last_connect_time = new Date()
      var communication_context = {
        protocol_version: response.payload.protocol_version || 1,
        auth_token: response.authorize.token
      }
      return done( null, { response: response, mite: mite, communication_context: communication_context } )
    }
    return done( null, { response: response, mite: mite } )
  }


  seneca
    .add( {role: name, generate: 'identify'}, identify )
    .add( {role: name, process_response: 'identify'}, response_identify )
}