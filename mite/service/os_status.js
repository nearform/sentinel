"use strict"

var os = require( 'os' )

module.exports = function( options ) {
  var seneca = this;
  var begin = Date.now()

  function cmd_retrieve_stats( args, done ) {
    var diff = Date.now() - begin

    var system = {}
    system.data = []
    system.timestamp = new Date()
    system.data.push( {name: 'OS Uptime', value: convertSecondsToDigitalClock( os.uptime() ), um: 'HH:MM:SS'} )
    system.data.push( {name: 'APP Uptime', value: convertSecondsToDigitalClock( diff / 1000 ), um: 'HH:MM:SS'} )

    system.data.push( {name: 'OS Id', value: os.hostname()} )
    system.data.push( {name: 'OS Arch', value: os.arch()} )
    system.data.push( {name: 'OS Type', value: os.type()} )
    system.data.push( {name: 'OS Release', value: os.release()} )
    system.data.push( {name: '# CPUS', value: os.cpus().length} )
    system.data.push( {name: 'Load Avg', value: os.loadavg()} )
    system.data.push( {name: 'Platform', value: os.platform()} )
    system.data.push( {name: 'Total memory', value: Math.floor( os.totalmem() / (1024 * 1024) ), um: 'MB'} )
    system.data.push( {name: 'Free memory', value: Math.floor( os.freemem() / (1024 * 1024) ), um: 'MB'} )
    system.data.push( {name: 'Used memory', value: Math.floor( (os.totalmem() - os.freemem()) / (1024 * 1024) ), um: 'MB'} )

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
    .add( {role: 'mite', retrieve: 'os_status'}, cmd_retrieve_stats )
}