"use strict"

module.exports = function( options ) {
  var name = 'mite'

  var entities = this.export( 'constants/entities' )

  function connectMite( args, done ) {
    var that = this

    var mite_id = args.id

    entities.getEntity( 'mite', this ).load$( {id: mite_id}, function( err, mite ) {
      if( err ) {
        return done( err )
      }

      that.act( "role:'mite',send:'identify'", {mite: mite}, function( err, command_response ) {
        if( err ) {
          return done( err )
        }

        done( err, command_response )
      } )
    } )
  }

  this
    .add( {role: name, cmd: 'connect'}, connectMite )
}