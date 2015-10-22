"use strict"

module.exports = function( options ) {
  var seneca = this;

  function cmd_stats( args, done ) {
    seneca.act( 'role:seneca,stats:true', function( err, senstats ) {
      senstats.date = new Date()
      done(err, senstats)
    } )
  }

  seneca
    .add( {role: 'status', get: 'seneca'}, cmd_stats )
}