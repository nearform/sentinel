"use strict"

module.exports = function() {
  var seneca = this;

  var monitor_id
  var status_data = []
  var configuration = {
    max_samples: 0
  }

  function set_configuration( args, done ) {

    configuration = args.configuration

    if( !configuration.max_samples || !configuration.rate_interval ) {
      return done( null, {ok: false, msg: 'Cannot start monitoring, invalid configuration data'} )
    }

    var interval = configuration.rate_interval * 1000

    // need to make sure no monitor is active
    if( monitor_id ) {
      clearInterval( monitor_id )
    }

    monitor_id = setInterval( function() {
      monitorOS()
    }, interval )

    monitorOS()

    done( null, {ok: true} )
  }


  function monitorOS() {
    seneca.act( "role: 'status', get: 'os'", function( err, statusData ) {
      if( err ) {
        return
      }

      status_data.push( statusData )
      if( status_data.length > 1 && status_data.length > configuration.max_samples ) {
        status_data.splice( 1, 0 )
      }
    } )
  }


  function get_os_status( args, done ) {
    done( null, status_data )
    status_data = []
  }


  seneca
    .add( {role: 'mite', set: 'configuration'}, set_configuration )
    .add( {role: 'mite', get: 'os_status'}, get_os_status )
}