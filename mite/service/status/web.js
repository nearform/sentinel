"use strict"

var os = require( 'os' )

module.exports = function( options ) {
  var seneca = this;


  function cmd_webstats( args, done ) {
    seneca.act( 'role:web,stats:true', function( err, webstats ) {
      webstats.date = new Date()
      done(err, webstats)
    } )
  }


  seneca
    .add( {role: 'status', get: 'web'}, cmd_webstats )
}