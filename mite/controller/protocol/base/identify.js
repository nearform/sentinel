"use strict"

module.exports = function( options ) {
  var seneca = this;

  var protocol_version = seneca.export( 'constants/protocol_version' )

  function identify( args, response ) {
    seneca.act( "role:'protocol', execute_command:'identify'",
      {
        command: args.command
      },
      response
    )
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