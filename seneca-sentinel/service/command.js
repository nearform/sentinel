"use strict"

module.exports = function( options ) {
  var seneca = this;
  var name = 'mite'

  var entities = seneca.export( 'constants/entities' )

  function sendIdentifyCommand( args, done ) {
    var mite = args.mite

    seneca.act( "role:'protocol',generate:'identify'", {mite: mite}, function( err, command ) {
      if( err ) {
        return done( err )
      }

      seneca.act( "role:'transport', send: 'command'", {mite: mite, command: command}, function( err, response ) {
        if (response.err){
          return done(null, response)
        }

        seneca.act( "role:'protocol', process_response: 'identify'", {mite: mite, response: response}, function( err, response ) {

          done( null, response )

        } )
      } )
    } )
  }

  function sendGetStatusCommand( args, done ) {
    var mite = args.mite
    var communication_context = args.communication_context

    seneca.act( "role:'protocol_v" + mite.protocol_version + "',generate:'get_status'", {mite: mite, communication_context: communication_context}, function( err, command ) {
      if( err ) {
        return done( err )
      }

      seneca.act( "role:'transport', send: 'command'", {mite: mite, command: command}, function( err, response ) {
        if (response.err){
          return done(null, response)
        }
        seneca.act( "role:'protocol_v" + mite.protocol_version + "', process_response: 'get_status'", {mite: mite, response: response}, function( err, response ) {

          done( null, response )

        } )

      } )
    } )
  }

  function sendConfigurationCommand( args, done ) {
    var mite = args.mite
    var communication_context = args.communication_context

    seneca.act( "role:'protocol_v" + mite.protocol_version + "',generate:'configuration'", {mite: mite, communication_context: communication_context}, function( err, command ) {
      if( err ) {
        return done( err )
      }

      seneca.act( "role:'transport', send: 'command'", {mite: mite, command: command}, function( err, response ) {
        if (response.err){
          return done(null, response)
        }

        seneca.act( "role:'protocol_v" + mite.protocol_version + "', process_response: 'configuration'", {mite: mite, response: response}, function( err, response ) {

          done( null, response )

        } )

      } )
    } )
  }


  seneca
    .add( {role: 'mite', send: 'identify'}, sendIdentifyCommand )
    .add( {role: 'mite', send: 'getStatus'}, sendGetStatusCommand )
    .add( {role: 'mite', send: 'configuration'}, sendConfigurationCommand )
}