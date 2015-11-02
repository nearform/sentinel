"use strict"

var uuid = require( 'node-uuid' )

module.exports = function( options ) {
  var seneca = this;
  var protocol_version = seneca.export( 'constants/protocol_version' )
  var error_codes = seneca.export( 'protocol_v1/error_codes' )

  function execute_identify( args, done ) {

    seneca.log.debug('Received command identify')

    seneca.act( "role: 'mite', create:'auth_token'", function( err, data ) {
      if( err ) {
        return done( null, {
          authorize: {
            token: ""
          },
          command: {
            type: 'identify'
          },
          execution: {
            err: true,
            code: error_codes.processing_error.code,
            timestamp: new Date(),
            msg: err
          },
          payload: {
          }
        } )

      }

      var token = data.token

      done( null, {
        authorize: {
          token: token
        },
        command: {
          type: 'identify'
        },
        execution: {
          err: false,
          code: error_codes.ok.code,
          timestamp: new Date()
        },
        payload: {
          protocol_version: 1
        }
      } )
    } )
  }

  seneca.add( {role: 'protocol', execute_command: 'identify'}, execute_identify )
}