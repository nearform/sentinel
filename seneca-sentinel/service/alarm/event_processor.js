"use strict"

var _ = require( 'lodash' )

module.exports = function( options ) {
  var seneca = this;

  var entities = seneca.export( 'constants/entities' )

  function notifyEvent( args, done ) {
    var mite_id = args.mite_id
    // read all alarms of the application

    entities.getEntity( 'mite', seneca ).load$( {id: mite_id}, function( err, mite ) {
      if( err ) {
        return done()
      }

      if( !mite ) {
        return done()
      }

      var alarms = mite.alarms || []
      for( var i in alarms ) {
        var alarm = alarms[i]
        if( !alarm.active ) {
          continue
        }
        if( alarm.data_type === args.data.data_type ) {
          processors[alarm.type]( mite, alarm, args.data )
        }
      }
      done()
    } )

    var processors = {
      amount: function( mite, alarm, data ) {
        var current_value = data.value
        var on_value = alarm.alarm_on
        var off_value = alarm.alarm_off

        if( current_value > on_value ) {
          // notify alarm on
          seneca.act( "start:'alarm'", {mite: mite, alarm: alarm, data: data} )
        }
        else if( current_value < off_value ) {
          {
            // notify alarm off
            seneca.act( "stop:'alarm'", {mite: mite, alarm: alarm, data: data} )
          }
        }
      }
    }
  }

  function startAlarm( args, done ) {
    // check if alarm already on
    entities.getEntity( 'alarm', seneca ).load$(
      {
        mite_id: args.mite.id,
        alarm_id: args.alarm.id,
        data_type: args.alarm.data_type,
        sort$: {onDate: -1}
      }, function( err, db_alarm ) {

        if( err ) {
          return done()
        }
        if( db_alarm && db_alarm.on ) {
          return done()
        }

        var alarm = entities.getEntity( 'alarm', seneca, args.alarm )
        alarm.onDate = new Date()
        alarm.on = true
        alarm.mite_id = args.mite.id
        alarm.alarm_id = alarm.id
        alarm.value = args.data.value
        alarm.um = args.data.um
        delete alarm.id
        alarm.save$( function( err, alarm ) {
          notifyAlarm( alarm, args.mite )
          done()
        } )
      } )
  }

  function stopAlarm( args, done ) {
    // check if alarm already off
    entities.getEntity( 'alarm', seneca ).load$(
      {
        mite_id: args.mite.id,
        alarm_id: args.alarm.id,
        data_type: args.alarm.data_type,
        sort$: {onDate: -1}
      }, function( err, db_alarm ) {

        if( err ) {
          return done()
        }
        if( !db_alarm ) {
          return done()
        }

        if( db_alarm && !db_alarm.on ) {
          return done()
        }

        db_alarm.offDate = new Date()
        db_alarm.on = false
        db_alarm.save$( function( err, alarm ) {
          notifyAlarm( alarm, args.mite )
          done()
        } )
      } )
  }

  function notifyAlarm( alarm, mite ) {
    // this can be changed to accept template messages - TBD
    var message = "N/A"
    if (alarm.on){
      message =
        "Alarm <" + alarm.name + "> for application <" + mite.name + ">" +
          " was activated with value: " + alarm.value + (alarm.um ? " " + alarm.um : "")

      if (alarm.dashboard_notification_alarm_on){
        seneca.act("role:'notification', create:'dashboard'", {message: message})
      }
      if (alarm.email_alarm_on){
        seneca.act("role:'notification', create:'email'", {message: message, to: alarm.email})
      }
    }

    if (alarm.off){
      message =
        "Alarm <" + alarm.name + "> for application <" + mite.name + ">" +
          " was stopped with value: " + alarm.value + (alarm.um ? " " + alarm.um : "")
      if (alarm.dashboard_notification_alarm_off){
        seneca.act("role:'notification', create:'dashboard'", {message: message})
      }
      if (alarm.email_alarm_off){
        seneca.act("role:'notification', create:'email'", {message: message, to: alarm.email})
      }
    }
  }

  seneca
    .add( {role: 'alarm', notify: 'data'}, notifyEvent )
    .add( {start: 'alarm'}, startAlarm )
    .add( {stop: 'alarm'}, stopAlarm )
}