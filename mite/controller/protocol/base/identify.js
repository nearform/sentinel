"use strict"

module.exports = function( options ) {
  var seneca = this;

  var protocol_version = seneca.export( 'constants/protocol_version' )

  function identify( args, response ) {
    seneca.act( "role: 'crypt', decrypt: 'message'", {message: args.command}, function(err, decrypt){
      var message
      try {
        message = JSON.parse( decrypt.message )
      } catch ( err ) {
        seneca.log.debug('Cannot parse message', decrypt.message)
        return response( null, {err: true, msg: 'Received unexpected response: ' + decrypt.message} )
      }

      seneca.act( "role:'protocol', execute_command:'identify'",
        {
          command: message.command
        },
        function(err, data){
          if (err){
            return response(err)
          }
          seneca.act( "role: 'crypt', encrypt: 'message'", {message: JSON.stringify(data)}, function(err, encrypt){
            response(err, {response: encrypt.message})
          })
        }
      )
    } )
  }

  seneca
    .add( {role: 'MiteProtocolBase', cmd: 'identify'}, identify )

  seneca.act( {role: 'web', use: {
    name: 'MiteProtocolBase',
    prefix: '/mite/',
    pin: {role: 'MiteProtocolBase', cmd: '*'},
    map: {
      identify: {POST: true, alias: 'identify'}
    }
  }} )
}