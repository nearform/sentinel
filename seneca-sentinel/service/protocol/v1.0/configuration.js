"use strict"

var _ = require( 'lodash' )

module.exports = function( options ) {
  var seneca = this;

  var entities = seneca.export( 'constants/entities' )
  var mite_status = seneca.export( 'constants/mite_status' )

  function configuration( args, done ) {
    var mite = args.mite
    var communication_context = args.communication_context

    done( null, {
      authorization: {
        token: communication_context.auth_token
      },
      command: {
        type: 'configuration'
      },
      payload: (mite.configuration || {

      })
    } )
  }


  function response_configuration( args, done ) {

    var response = args.response
    var mite = args.mite

    if( response.execution.err ) {
      return done( null, { err: true, code: response.execution.code, message: response.execution.msg} )
    }

    return done( null, { err: false, response: response, mite: mite } )

  }

  seneca
    .add( {role: 'protocol_v1', generate: 'configuration'}, configuration )
    .add( {role: 'protocol_v1', process_response: 'configuration'}, response_configuration )
}