"use strict"

module.exports = function () {
  var seneca = this;

  var monitor_id
  var status_data = []
  var configuration = {
    max_samples: 0
  }

  function set_configuration( args, done ) {

    if ( !args.configuration.max_samples || !args.configuration.rate_interval ) {
      return done( null, {ok: false, msg: 'Cannot start monitoring, invalid configuration data'} )
    }

    var max_samples = args.configuration.max_samples
    var rate_interval = args.configuration.rate_interval

    if ( isNaN( max_samples ) ) {
      seneca.log.debug( 'Received an invalid max_samples', max_samples, 'replace with default value 10' )
      max_samples = 10
    }

    if ( isNaN( rate_interval ) ) {
      seneca.log.debug( 'Received an invalid rate_interval', rate_interval, 'replace with default value 600' )
      rate_interval = 600
    }

    var configuration = {
      rate_interval: parseInt(rate_interval) * 1000,
      max_samples: parseInt(max_samples)
    }

    // need to make sure no monitor is active
    if ( monitor_id ) {
      clearInterval( monitor_id )
    }

    monitor_id = setInterval( function () {
      monitorOS()
    }, configuration.rate_interval )

    monitorOS()

    done( null, {ok: true} )
  }


  function monitorOS() {
    seneca.act( "role: 'status', get: 'os'", function ( err, statusData ) {
      if ( err ) {
        seneca.log.debug( 'Error receiving os status', err )
        return
      }

      status_data.push( statusData )
      if ( status_data.length > 1 && status_data.length > configuration.max_samples ) {
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