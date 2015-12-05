"use strict"

var _ = require('lodash')

module.exports = function (options) {
  var seneca = this

  var entities = this.export('constants/entities')
  var mite_status = this.export('constants/mite_status')

  var monitor_data = {}

  function start (args, done) {
    changeMonitorStatus(args.id, true, done)
  }


  function stop (args, done) {
    changeMonitorStatus(args.id, false, done)
  }


  function changeMonitorStatus (mite_id, monitor_status, done) {

    entities.getEntity('mite', this).load$({id: mite_id}, function (err, mite) {
      if (err) {
        return done(err)
      }

      mite.monitoring = monitor_status

      mite.save$(function (err, mite) {
        if (err) {
          return done(err)
        }

        if (monitor_status) {
          // start monitor
          startMonitorMite(mite)
        }
        else {
          // stop monitor
          var mite_monit_data = monitor_data[mite_id]
          if (mite_monit_data && mite_monit_data.monitor_id) {
            clearInterval(mite_monit_data.monitor_id)
            mite_monit_data.started = false
          }

          var sm_name = create_sm_name(mite)
          this.act("role: 'sm', close: 'instance'", {name: sm_name}, function (err, data) {
            if (err) {
              this.log('Cannot close state machine', sm_name, err)
            } else{
              this.log('State machine', sm_name, ' closed')
            }
          })
        }

        mite = mite.data$(false)
        done(err, mite)
      })
    })
  }


  function runSuiteMonitor (args, done) {
    var suite_id = args.suite_id
    var mite_id = args.mite_id

    entities.getEntity('mite', this).load$({id: mite_id}, function (err, mite) {
      if (err) {
        return done(err)
      }

      for (var i in mite.suites) {
        if (suite_id === mite.suites[i].id) {

          var suite = mite.suites[i]

          this.act("role:'suite', cmd:'run_once'", {mite: mite, suite: suite}, function () {
          })
          break
        }
      }
      done()
    })
  }


  function startSuiteMonitor (args, done) {
    changeSuiteMonitorStatus(args, true, done)
  }


  function stopSuiteMonitor (args, done) {
    changeSuiteMonitorStatus(args, false, done)
  }


  function changeSuiteMonitorStatus (args, monitor_status, done) {
    var suite_id = args.suite_id
    var mite_id = args.mite_id

    entities.getEntity('mite', this).load$({id: mite_id}, function (err, mite) {
      if (err) {
        return done(err)
      }

      var found = false
      for (var i in mite.suites) {
        if (suite_id === mite.suites[i].id) {

          found = true
          var suite = mite.suites[i]

          suite.monitoring = monitor_status
          mite.save$(function (err, mite) {
            if (monitor_status) {
              // start monitor
              this.act("role:'suite', cmd:'verify_status'", {mite: mite, suite: suite}, function () {
              })
            }
            else {
              this.act("role:'suite', cmd:'verify_status'", {mite: mite, suite: suite}, function () {
              })
              // stop monitor
            }

            mite = mite.data$(false)
            done(err, mite)
          })
        }
      }
      if (!found) {
        return done()
      }

    })
  }


  function start_monitor () {
    entities.getEntity('mite', seneca).list$({}, function (err, mites) {
      if (err) {
        return
      }
      mites = mites || []

      _.each(mites, function (mite) {
        startMonitorMite(mite)
      })
    })
  }


  function create_sm_name (mite) {
    return "sm_" + mite.id
  }

  function startMonitorMite (mite) {
    if (mite.monitoring) {
      var sm_config = require('../../config.sm.json')
      sm_config.name = create_sm_name(mite)
      seneca.act("role: 'sm', create: 'instance'", sm_config, function () {
        var interval = (mite.monitor ? ( mite.monitor.interval || 10 ) : 10) * 1000
        monitor_data[mite.id] = {
          started: true,
          monitor_id: setInterval(function () {
            var id = mite.id
            monitorMite(id)
          }, interval),
          mite_id: mite.id
        }
      })
    }
  }


  function monitorMite (id) {
    entities.getEntity('mite', seneca).load$({id: id}, function (err, mite) {
      if (err) {
        return
      }

      this.act(
        "role:'" + create_sm_name(mite) + "',cmd:'execute'",
        {
          mite: mite,
          communication_context: monitor_data[mite.id].communication_context || {}
        },
        function (err, response) {
          if (response.communication_context) {
            monitor_data[mite.id].communication_context = response.communication_context
          }

          this.act("role: '" + create_sm_name(mite) + "', get: 'context'", function (err, context) {
            mite.status = context.current_status

            mite.save$(function (err, mite) {
            })
          })
        })
    })
  }

  function init (args, done) {
    start_monitor()
    done()
  }

  this
    .add({role: 'monitoring', cmd: 'start'}, start)
    .add({role: 'monitoring', cmd: 'stop'}, stop)
    .add({role: 'monitoring', suite_monitor: 'run'}, runSuiteMonitor)
    .add({role: 'monitoring', suite_monitor: 'start'}, startSuiteMonitor)
    .add({role: 'monitoring', suite_monitor: 'stop'}, stopSuiteMonitor)
    .add('init:monitor', init)

  // @hack
  init({}, function () {
  })
}
