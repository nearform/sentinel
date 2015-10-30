"use strict"

var _ = require( 'lodash' )

module.exports = function( options ) {
  var seneca = this;

  var entities = seneca.export( 'constants/entities' )
  var mite_status = seneca.export( 'constants/mite_status' )

  var monitor_data = {}

  function start( args, done ) {
    changeMonitorStatus( args.id, true, done )
  }


  function stop( args, done ) {
    changeMonitorStatus( args.id, false, done )
  }


  function changeMonitorStatus( mite_id, monitor_status, done ) {

    entities.getEntity( 'mite', seneca ).load$( {id: mite_id}, function( err, mite ) {
      if( err ) {
        return done( err )
      }

      mite.monitoring = monitor_status

      mite.save$( function( err, mite ) {
        if( err ) {
          return done( err )
        }

        if( monitor_status ) {
          // start monitor
          startMonitorMite( mite )
        }
        else {
          // stop monitor
          var mite_monit_data = monitor_data[mite_id]
          if( mite_monit_data && mite_monit_data.monitor_id ) {
            clearInterval( mite_monit_data.monitor_id )
            mite_monit_data.started = false
          }
        }

        mite = mite.data$( false )
        done( err, mite )
      } )
    } )
  }


  function runSuiteMonitor( args, done ) {
    var suite_id = args.suite_id
    var mite_id = args.mite_id

    entities.getEntity( 'mite', seneca ).load$( {id: mite_id}, function( err, mite ) {
      if( err ) {
        return done( err )
      }

      for( var i in mite.suites ) {
        if( suite_id === mite.suites[i].id ) {

          var suite = mite.suites[i]

          seneca.act( "role:'suite', cmd:'run_once'", {mite: mite, suite: suite}, function() {
          } )
          break
        }
      }
      done()
    } )
  }


  function startSuiteMonitor( args, done ) {
    changeSuiteMonitorStatus( args, true, done )
  }


  function stopSuiteMonitor( args, done ) {
    changeSuiteMonitorStatus( args, false, done )
  }


  function changeSuiteMonitorStatus( args, monitor_status, done ) {
    var suite_id = args.suite_id
    var mite_id = args.mite_id

    entities.getEntity( 'mite', seneca ).load$( {id: mite_id}, function( err, mite ) {
      if( err ) {
        return done( err )
      }

      var found = false
      for( var i in mite.suites ) {
        if( suite_id === mite.suites[i].id ) {

          found = true
          var suite = mite.suites[i]

          suite.monitoring = monitor_status
          mite.save$( function( err, mite ) {
            if( monitor_status ) {
              // start monitor
              seneca.act( "role:'suite', cmd:'verify_status'", {mite: mite, suite: suite}, function() {
              } )
            }
            else {
              seneca.act( "role:'suite', cmd:'verify_status'", {mite: mite, suite: suite}, function() {
              } )
              // stop monitor
            }

            mite = mite.data$( false )
            done( err, mite )
          } )
        }
      }
      if( !found ) {
        return done()
      }

    } )
  }


  function start_monitor() {
    entities.getEntity( 'mite', seneca ).list$( {}, function( err, mites ) {
      if( err ) {
        return
      }
      mites = mites || []

      _.each( mites, function( mite ) {
        startMonitorMite( mite )
      } )
    } )
  }


  function startMonitorMite( mite ) {
    if( mite.monitoring ) {
      var sm_config = require('../../config.sm.json')
      sm_config.name = "sm_" + mite.name
      seneca.act( "role: 'sm', create: 'instance'", sm_config, function(){
        var interval = (mite.monitor ? ( mite.monitor.interval || 10 ) : 10) * 1000
        monitor_data[mite.id] = {
          started: true,
          monitor_id: setInterval( function() {
            var id = mite.id
            monitorMite( id )
          }, interval ),
          mite_id: mite.id
        }
      } )
    }
  }


  function monitorMite( id ) {
    entities.getEntity( 'mite', seneca ).load$( {id: id}, function( err, mite ) {
      if( err ) {
        return
      }

      seneca.act(
        "role:'sm_" + mite.name + "',cmd:'execute'",
        {
          mite: mite,
          communication_context: monitor_data[mite.id].communication_context || {}
        },
        function( err, response ) {
        monitor_data[mite.id].communication_context = response.communication_context || {}
        seneca.act( "role: 'sm_" + mite.name + "', get: 'context'", function( err, context ) {
          mite.status = context.state

          mite.save$( function( err, mite ) {
          } )
        } )
      } )
    } )
  }

  function init( args, done ) {
    start_monitor()
    done()
  }

  seneca
    .add( {role: 'monitoring', cmd: 'start'}, start )
    .add( {role: 'monitoring', cmd: 'stop'}, stop )
    .add( {role: 'monitoring', suite_monitor: 'run'}, runSuiteMonitor )
    .add( {role: 'monitoring', suite_monitor: 'start'}, startSuiteMonitor )
    .add( {role: 'monitoring', suite_monitor: 'stop'}, stopSuiteMonitor )
    .add( 'init:monitor', init )

  // @hack
  init( {}, function() {
  } )
}





/*
 if( mite_status.NOT_CONNECTED === mite.status ) {
 console.log( 'Monitor', mite.name, 'identify' )
 seneca.act( "role:'mite',send:'identify'", {mite: mite}, function( err, response ) {

 if( response ) {
 if( response.err ) {
 seneca.act( "role: 'notification', notify: 'not_connect'", {mite: mite}, function() {
 } )
 mite.status = mite_status.NOT_CONNECTED
 }
 else {
 mite = _.extend( mite, response.mite )
 mite.status = mite_status.IDENTIFIED
 monitor_data[mite.id].communication_context = response.communication_context
 }
 }
 else {
 mite.status = mite_status.NOT_CONNECTED
 }

 mite.save$( function( err, mite ) {
 if( mite_status.NOT_CONNECTED != mite.status ) {
 monitorMite( id )
 }
 } )
 } )
 }
 else if( mite_status.IDENTIFIED === mite.status ) {
 console.log( 'Monitor', mite.name, 'configuration' )
 seneca.act(
 "role:'mite',send:'configuration'",
 {
 mite: mite,
 communication_context: monitor_data[mite.id].communication_context || {}
 }, function( err, response ) {

 if( response ) {
 if( response.err ) {
 mite.status = mite_status.NOT_CONNECTED
 }
 else {
 mite = _.extend( mite, response.mite )
 mite.status = mite_status.MONITORING
 }
 }
 else {
 mite.status = mite_status.NOT_CONNECTED
 }

 mite.save$( function( err, mite ) {
 console.log('Identified', mite.name)
 } )
 } )
 }
 else if( mite_status.MONITORING === mite.status ) {
 console.log( 'Monitor', mite.name, 'getStatus' )
 seneca.act(
 "role:'mite',send:'getStatus'",
 {
 mite: mite,
 communication_context: monitor_data[mite.id].communication_context || {}
 },
 function( err, response ) {

 if( response ) {
 if( response.err ) {
 mite.status = mite_status.NOT_CONNECTED
 }
 //              else {
 //                mite = _.extend( mite, response.mite )
 //              }
 }
 else {
 mite.status = mite_status.NOT_CONNECTED
 }

 mite.save$( function() {
 console.log('Monitoring', mite.name)
 } )

 } )
 }
 else {
 mite.status = mite_status.NOT_CONNECTED
 mite.save$( function() {
 console.log('Not connected', mite.name)
 } )
 }

 */