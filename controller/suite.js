"use strict"

module.exports = function( options ) {
  var seneca = this;
  var name = 'SuiteCtrl'

  var entities = seneca.export( 'constants/entities' )

  function runOnceSuite( msg, response ) {
    var that = this
    var mite_id = msg.mite_id
    var suite_id = msg.suite_id

    that.act( "role:'monitoring',suite_monitor: 'run'", {mite_id: mite_id, suite_id: suite_id}, function( err ) {
      if( err ) {
        return response( null, {err: true, msg: err} )
      }

      response( null, {err: false} )
    } )
  }


  function startMonitoring( msg, response ) {
    var that = this
    var mite_id = msg.mite_id
    var suite_id = msg.suite_id

    that.act( "role:'monitoring',suite_monitor:'start'", {mite_id: mite_id, suite_id: suite_id}, function( err ) {
      if( err ) {
        return response( null, {err: true, msg: err} )
      }

      response( null, {err: false} )
    } )
  }


  function stopMonitoring( msg, response ) {
    var that = this
    var mite_id = msg.mite_id
    var suite_id = msg.suite_id

    that.act( "role:'monitoring',suite_monitor:'stop'", {mite_id: mite_id, suite_id: suite_id}, function( err ) {
      if( err ) {
        return response( null, {err: true, msg: err} )
      }

      response( null, {err: false} )
    } )
  }


  function listTests( msg, response ) {
    var suite_id = msg.suite_id

    entities.getEntity( 'suite_test', seneca ).list$( {sort$: {end: -1}, suite_id: suite_id, limit$: 10}, function( err, tests ) {
      if( err ) {
        return response( null, {err: true, msg: err} )
      }

      tests = tests || []

      for( var i in tests ) {
        tests[i] = tests[i].data$( false )
      }

      response( null, {err: false, data: tests, count: tests.length} )
    } )
  }

  function replayRequest( msg, response ) {
    var that = this
    that.act("role: 'suite', replay:'request'", msg, function(err, result){
      if (err){
        return response(null, {err: true, msg: err})
      }

      return response(null, {err: false, data: result})
    })
  }


  seneca
    .add( {role: name, cmd: 'startMonitoring'}, startMonitoring )
    .add( {role: name, cmd: 'stopMonitoring'},  stopMonitoring  )
    .add( {role: name, cmd: 'runOnceSuite'},    runOnceSuite    )
    .add( {role: name, cmd: 'listTests'},       listTests       )
    .add( {role: name, cmd: 'replayRequest'},   replayRequest   )


  seneca.act( {role: 'web', use: {
    name: name,
    prefix: '/api/',
    pin: {role: name, cmd: '*'},
    map: {
      startMonitoring:  {POST: true, alias: 'mite/:mite_id/suite/:suite_id/monitor/start'},
      stopMonitoring:   {POST: true, alias: 'mite/:mite_id/suite/:suite_id/monitor/stop'},
      runOnceSuite:     {POST: true, alias: 'mite/:mite_id/suite/:suite_id/run/once'},
      listTests:        {GET : true, alias: 'suite/:suite_id/tests'},
      replayRequest:    {POST: true, alias: 'suite/:suite_id/replayTest'}
    }
  }} )
}