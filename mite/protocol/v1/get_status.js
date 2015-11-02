"use strict"

var os = require( 'os' )

module.exports = function( options ) {
  var seneca = this;


  function execute_get_status( args, done ) {
    seneca.log.debug( 'Command get_status', args.command )

    seneca.act( "role: 'mite', get: 'os_status'", function( err, system ) {
      if( err ) {
        return done( err, {ok: false} )
      }
      var payload = {
        os: system
      }

      seneca.act( "role: 'status', get: 'seneca'", function( err, stats ) {
        if( err ) {
          return done( err, {ok: false} )
        }

        payload.seneca_stats = stats

        seneca.act( "role: 'status', get: 'web'", function( err, webstats ) {
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
    seneca.act( 'role:seneca,stats:true', function( err, senstats ) {
      senstats.date = new Date()
      done(err, senstats)
    } )
  }


  function cmd_webstats( done ) {
    seneca.act( 'role:web,stats:true', function( err, webstats ) {
      webstats.date = new Date()
      done(err, webstats)
    } )
  }


  seneca
    .add( {protocol: 1, execute_command: 'getStatus'}, execute_get_status )
}