"use strict"

var os = require( 'os' )

module.exports = function( options ) {
  var seneca = this;
  var begin = Date.now()
  var restarted = true

  var begin_str = new Date(begin).toString()

  function cmd_retrieve_stats( args, done ) {
    var diff = Date.now() - begin

    var system = {}
    system.data = []
    system.date = new Date()

    system.data.push( {
      name: 'Application start time',
      value: begin_str,
      data_type: 'application_start_time'
    } )

    system.data.push( {
      name: 'APP Uptime',
      value: convertSecondsToDigitalClock( diff / 1000 ),
      data_type: 'app_uptime',
      um: 'HH:MM:SS'} )

    system.data.push( {
      name: 'OS Uptime',
      value: convertSecondsToDigitalClock( os.uptime() ),
      data_type: 'os_uptime',
      um: 'HH:MM:SS'} )

    system.data.push( {
      name: 'OS Id',
      data_type: 'os_id',
      value: os.hostname()} )

    system.data.push( {
      name: 'OS Arch',
      data_type: 'os_arch',
      value: os.arch()
    } )

    system.data.push( {
      name: 'OS Type',
      data_type: 'os_type',
      value: os.type()
    } )

    system.data.push( {
      name: 'OS Release',
      data_type: 'os_release',
      value: os.release()
    } )

    system.data.push( {
      name: '# CPUS',
      data_type: 'cpus',
      value: os.cpus().length
    } )

    system.data.push( {
      name: 'Load Avg 1 minute',
      data_type: 'load_1',
      value: os.loadavg()[0]
    } )

    system.data.push( {
      name: 'Load Avg 5 minutes',
      data_type: 'load_5',
      value: os.loadavg()[1]
    } )

    system.data.push( {
      name: 'Load Avg 15 minutes',
      data_type: 'load_15',
      value: os.loadavg()[2]
    } )

    system.data.push( {
      name: 'Platform',
      data_type: 'platform',
      value: os.platform()
    } )

    system.data.push( {
      name: 'Total memory',
      data_type: 'total_memory',
      value: Math.floor( os.totalmem() / (1024 * 1024) ),
      um: 'MB'
    } )

    system.data.push( {
      name: 'Free memory',
      value: Math.floor( os.freemem() / (1024 * 1024) ),
      data_type: 'free_memory',
      um: 'MB'
    } )

    system.data.push( {
      name: 'Used memory',
      value: Math.floor( (os.totalmem() - os.freemem()) / (1024 * 1024) ),
      data_type: 'used_memory',
      um: 'MB'
    } )

    system.data.push( {
      name: 'Application restarted',
      value: restarted,
      data_type: 'application_restarted'
    } )
    restarted = false

    done( null, system )
  }

  function convertSecondsToDigitalClock( s ) {
    var days = Math.floor( s / (3600 * 24) )

    s = s - days * 3600 * 24
    var hours = Math.floor( s / 3600 )
    if( hours < 10 ) {
      hours = '0' + hours
    }
    var minutes = Math.floor( (s % 3600) / 60 )
    if( minutes < 10 ) {
      minutes = '0' + minutes
    }
    var seconds = Math.floor( (s % 3600) % 60 )
    if( seconds < 10 ) {
      seconds = '0' + seconds
    }
    return (days ? days + ' days ' : '') + hours + ":" + minutes + ":" + seconds
  }

  seneca
    .add( {role: 'status', get: 'os'}, cmd_retrieve_stats )
}