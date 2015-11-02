"use strict"

module.exports = function( options ) {
  var seneca = this;

  function generate_response( args, done ) {
    var cmd = args.command
    var error_codes = seneca.export( 'protocol_v1/error_codes' )

    seneca.log.debug( 'Received command', cmd )

    if( !cmd.command || !cmd.command.type ) {
      return done(
        null,
        {
          authorize: {
            token: ""
          },
          command: {
          },
          execution: {
            err: true,
            code: error_codes.processing_error.code,
            msg: error_codes.processing_error.message,
            timestamp: new Date()
          }
        }
      )
    }

    seneca.act( "role: 'mite', get:'auth_token'", function( err, data ) {
      if( err ) {
        return done(
          null,
          {
            authorize: {
              token: ""
            },
            command: {
              type: cmd.command.type
            },
            execution: {
              err: true,
              code: error_codes.processing_error.code,
              msg: err,
              timestamp: new Date()
            }
          }
        )
      }

      var token = data.token
      seneca.act( "role: 'mite', authorize:'command'", cmd, function( err, auth ) {
        if( err || !auth.ok ) {
          return done(
            null,
            {
              authorize: {
                token: token
              },
              command: {
                type: cmd.command.type
              },
              execution: {
                err: true,
                code: error_codes.not_auth.code,
                msg: error_codes.not_auth.message,
                timestamp: new Date()
              }
            }
          )
        }

        // execute command
        seneca.act(
          "protocol:1,execute_command:'" + cmd.command.type + "'",
          {
            command: cmd,
            default$: {
              authorize: {
                token: token
              },
              command: {
                type: cmd.command.type
              },
              execution: {
                err: true,
                code: error_codes.protocol_invalid_type.code,
                msg: error_codes.protocol_invalid_type.message,
                timestamp: new Date()
              },
              payload: {}
            }
          },
          function( err, execution_data ) {
            var payload = execution_data.payload || {}

            // special case when the command type is invalid
            if( execution_data && execution_data.execution && execution_data.execution.code === error_codes.protocol_invalid_type.code ) {
              return done( null, execution_data )
            }

            if( err || !execution_data.ok ) {
              return done( null, {
                authorize: {
                  token: token
                },
                command: {
                  type: cmd.command.type
                },
                execution: {
                  err: true,
                  code: error_codes.processing_error.code,
                  msg: err,
                  timestamp: new Date()
                },
                payload: payload
              } )
            }

            done( null, {
              authorize: {
                token: token
              },
              command: {
                type: cmd.command.type
              },
              execution: {
                err: false,
                code: error_codes.ok.code,
                timestamp: new Date()
              },
              payload: payload
            } )
          } )
      } )
    } )
  }

  seneca
    .add( {role: 'protocol_v1', generate: 'response'}, generate_response )
}