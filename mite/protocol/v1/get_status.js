"use strict"

var os = require( 'os' )

module.exports = function( options ) {
  var seneca = this;


  function execute_get_status( args, done ) {
    console.log( 'Command get_status' )

    seneca.act( "role: 'mite', get: 'os_status'", function( err, system ) {
      if( err ) {
        return done( err, {ok: false} )
      }
      var payload = {
        os: system
      }

      cmd_stats( function( err, stats ) {
        if( err ) {
          return done( err, {ok: false} )
        }

        payload.seneca_stats = stats

        cmd_webstats( function( err, webstats ) {
          if( err ) {
            return done( err, {ok: false} )
          }

          payload.web_stats = webstats
          done( null, { ok: true, payload: payload} )
        } )
      } )
    } )
  }


  function cmd_stats( done ) {
    seneca.act( 'role:seneca,stats:true', done )
  }


  function cmd_webstats( done ) {
    seneca.act( 'role:web,stats:true', done )
  }


  seneca
    .add( {protocol: 1, execute_command: 'getStatus'}, execute_get_status )
}