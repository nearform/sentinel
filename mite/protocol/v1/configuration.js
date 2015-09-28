"use strict"

module.exports = function( options ) {
  var seneca = this;

  function execute_configuration( args, done ) {
    console.log( 'Command configuration' )
    var cmd = args.command

    var command_payload = cmd.payload
    seneca.act( "role: 'mite', set:'configuration'", { configuration: command_payload}, done )
  }

  seneca
    .add( {protocol: 1, execute_command: 'configuration'}, execute_configuration )
}