"use strict"

module.exports = function( options ) {
  var entities = this.export( 'constants/entities' )

  function sendIdentifyCommand( args, done ) {
    var that = this

    var mite = args.mite

    that.act( "role:'protocol',generate:'identify'", {mite: mite}, function( err, command ) {
      if( err ) {
        return done( err )
      }

      that.act( "role:'transport', send: 'command'", {mite: mite, command: command}, function( err, response ) {
        if (response.err){
          return done(null, response)
        }

        that.act( "role:'protocol', process_response: 'identify'", {mite: mite, response: response}, function( err, response ) {

          done( null, response )

        } )
      } )
    } )
  }

  function sendGetStatusCommand( args, done ) {
    var that = this

    var mite = args.mite
    var communication_context = args.communication_context

    that.act( "role:'protocol_v" + mite.protocol_version + "',generate:'get_status'", {mite: mite, communication_context: communication_context}, function( err, command ) {
      if( err ) {
        return done( err )
      }

      that.act( "role:'transport', send: 'command'", {mite: mite, command: command}, function( err, response ) {
        if (response.err){
          return done(null, response)
        }
        that.act( "role:'protocol_v" + mite.protocol_version + "', process_response: 'get_status'", {mite: mite, response: response}, function( err, response ) {

          done( null, response )

        } )

      } )
    } )
  }

  function sendConfigurationCommand( args, done ) {
    var that = this

    var mite = args.mite
    var communication_context = args.communication_context

    that.act( "role:'protocol_v" + mite.protocol_version + "',generate:'configuration'", {mite: mite, communication_context: communication_context}, function( err, command ) {
      if( err ) {
        return done( err )
      }

      that.act( "role:'transport', send: 'command'", {mite: mite, command: command}, function( err, response ) {
        if (response.err){
          return done(null, response)
        }

        that.act( "role:'protocol_v" + mite.protocol_version + "', process_response: 'configuration'", {mite: mite, response: response}, function( err, response ) {

          done( null, response )

        } )

      } )
    } )
  }


  this
    .add( {role: 'mite', send: 'identify'}, sendIdentifyCommand )
    .add( {role: 'mite', send: 'getStatus'}, sendGetStatusCommand )
    .add( {role: 'mite', send: 'configuration'}, sendConfigurationCommand )
}