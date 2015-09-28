"use strict"

var _ = require( 'lodash' )
var async = require( 'async' )
var request = require( 'request' )
var uuid = require( 'node-uuid' )
var parambulator = require( 'parambulator' )

module.exports = function( options ) {
  var seneca = this;

  var entities = seneca.export( 'constants/entities' )
  var mite_status = seneca.export( 'constants/mite_status' )
  var monitor_context = {}
  var monitor_ids = {}

  function runOnce( args, done ) {
    var suite = args.suite
    var mite = args.mite

    if( monitor_context[mite.id] && monitor_context[mite.id][suite.id] && monitor_context[mite.id][suite.id].running ) {
      return done( 'Suite test in progress, cannot run another test instance' )
    }

    if( !monitor_context[mite.id] ) {
      monitor_context[mite.id] = {}
    }

    monitor_context[mite.id][suite.id] = {
      running: true,
      start: new Date(),
      operations: [],
      validated: true
    }

    // callback call - test will run in background
    done()

    entities.getEntity(
      'suite_test',
      seneca,
      {
        mite_id: mite.id,
        name: suite.name,
        suite_id: suite.id,
        start: monitor_context[mite.id][suite.id].start,
        operations: []
      } ).save$( function( err, test ) {

      if( err ) {
        monitor_context[mite.id][suite.id].running = false
        return
      }
      console.log( 'run test suite' + suite.name )

      async.eachSeries( suite.urls, runTestUrl, function( err, results ) {
        var data = monitor_context[mite.id][suite.id]
        var context = monitor_context[mite.id][suite.id]
        test.operations = data.operations
        test.end = new Date()

        monitor_context[mite.id][suite.id] = {}

        test.validated = true
        for( var i in test.operations ) {
          if( !test.operations[i].validated ) {
            test.validated = false
          }
        }

        test.save$( function( err ) {
          entities.getEntity( 'mite', seneca ).load$( {id: mite.id}, function( err, mite ) {
            if( err ) {
              return
            }

            mite.last_connect_time = test.end
            mite.suites_validated = true
            for( var i in mite.suites ) {
              if( mite.suites[i].id === suite.id ) {
                mite.suites[i].last_test_date = test.end
                mite.suites[i].validated = context.validated
              }
              if( !mite.suites[i].validated ) {
                mite.suites_validated = false
              }
            }

            mite.save$( function() {
            } )
          } )
        } )
      } )
    } )


    function runTestUrl( urlConfig, done ) {

      var begin = new Date()
      console.log( 'run ' + urlConfig.url )

      sendRequest( mite, urlConfig, function( err, data ) {

        var response = data.response
        var http_response = data.http_response
        var url = data.url

        if( err ) {
          var htt_status = "N/A"
          if (err.code){
            htt_status = err.code
          }
          addHistory( {start: begin, err: err, response: response, url: url, http_status: htt_status, validated: false} )
          if( urlConfig.stop_on_error ) {
            return done( err )
          }
          else {
            return done()
          }
        }

        validateResponse( response, urlConfig.validate_response, function( validate_result ) {
          if( validate_result.err ) {
            addHistory( {start: begin, err: err, response: response, url: url, http_status: http_response.statusCode, validated: false, validation: validate_result} )
            if( urlConfig.stop_on_error ) {
              return done( err )
            }
            else {
              return done()
            }
          }

          addHistory( {start: begin, err: err, response: response, url: url, http_status: http_response.statusCode, validated: true, validation: validate_result} )
          done()
        } )
      } )


      function addHistory( operation ) {
        if( !operation.validated ) {
          monitor_context[mite.id][suite.id].validated = false
        }

        if( urlConfig.request ) {
          operation.request = {}
          operation.request.body = urlConfig.request
        }

        operation.end = new Date()
        monitor_context[mite.id][suite.id].operations.push( operation )
      }


      function validateResponse( response, validate_response, done ) {
        if( urlConfig.validate_response ) {

          var scheme
          try {
            scheme = JSON.parse( urlConfig.validate_response )
          }
          catch( err ) {
            return done( {err: false, msg: 'Invalid parambulator scheme.', scheme: urlConfig.validate_response} )
          }
          var paramcheck = parambulator( scheme )
          paramcheck.validate( response, function( err ) {
            if( err ) {
              return done( {err: true, msg: err, scheme: urlConfig.validate_response} )
            }
            done( {err: false, msg: 'Validated.', scheme: urlConfig.validate_response} )
          } )

        }
        else {
          done( {err: false, msg: 'No validation scheme set.', scheme: 'N/A'} )
        }
      }
    }


    function sendRequest( mite, urlConfig, done ) {
      var method = urlConfig.method.toLowerCase()
      var url = mite.protocol + "://" + mite.host + ":" + mite.port + urlConfig.url

      // validate req_body
      var req_body = urlConfig.request

      var req = {
        url: url
      }
      if( req_body ) {
        try {
          req_body = JSON.parse( req_body )
        }
        catch( err ) {
          return done( err, {url: url} )
        }

        req.headers = {"Content-Type": "application/json"}
        req.body = JSON.stringify( req_body )
      }

//      if (urlConfig.authorized && cookies['seneca-login']){
//        request.cookie('seneca-login' + '=' + cookies['seneca-login'])
//      }

      request[method]( req,
        function( err, response, body ) {
          if( err ) {
            return done( err, {response: resp, http_response: response, url: url} )
          }

          if( 200 != response.statusCode ) {
            // just try to parse response, maybe....
            var resp = body
            try {
              resp = JSON.parse( body )
            }
            catch( err ) {
            }

            return done( 'Status Code: ' + response.statusCode, {response: resp, http_response: response, url: url} )
          }

          // get auth-cookie - if exists
          var cookies = parse_cookies(response)
          var resp
          try {
            resp = JSON.parse( body )
          }
          catch( err ) {
            console.log( 'Received unexpected response: ' + body )
            return done( err, {response: resp, http_response: response, url: url} )
          }

          return done( err, {response: resp, http_response: response, url: url} )
        }
      )
    }
  }

  function parse_cookies(response){
    var cookies = {}
    if ( response.headers && response.headers['set-cookie'] ){

      for (var i in response.headers['set-cookie']){
        var cookie_str = response.headers['set-cookie'][i]
        var index = cookie_str.indexOf('=')
        if (index > 0){
          var cookie_name = cookie_str.substr(0, index)
          var cookie_value = cookie_str.substr(index)
          cookies[cookie_name] = cookie_value
        }
      }
    }
    return cookies
  }

  function start_monitor() {
    entities.getEntity( 'mite', seneca ).list$( {}, function( err, mites ) {
      if( err ) {
        return
      }
      mites = mites || []

      _.each( mites, function( mite ) {
        mite.suites = mite.suites || []
        _.each( mite.suites, function( suite ) {
          verifyMonitorMiteSuite( mite, suite )
        } )
      } )
    } )
  }


  function verifyMonitorMiteSuite( mite, suite ) {
    if( suite.monitoring ) {
      var interval = (suite.monitor_interval ? ( suite.monitor_interval || 60 * 10 ) : 60 * 10) * 1000

      monitor_ids['suite' + suite.id] = {
        started: true,
        monitor_id: setInterval( function() {
          var suite_id = suite.id
          var mite_id = mite.id
          monitorSuite( mite_id, suite_id )
        }, interval ),
        mite_id: mite.id,
        suite_id: suite.id
      }
    }
    else {
      if( monitor_ids['suite' + suite.id] ) {
        var monitor_id = monitor_ids['suite' + suite.id].monitor_id
        if (monitor_id){
          clearInterval( monitor_id );
        }
        delete monitor_ids['suite' + suite.id]
      }
    }
  }


  function monitorSuite( mite_id, suite_id ) {
    entities.getEntity( 'mite', seneca ).load$( {id: mite_id}, function( err, mite ) {
      if( err ) {
        return
      }
      if( !mite ) {
        return
      }

      for( var i in mite.suites ) {
        if( mite.suites[i].id === suite_id ) {
          seneca.act( "role: 'suite', cmd: 'run_once'", {mite: mite, suite: mite.suites[i]}, function( err ) {
          } )
        }
      }
    } )
  }


  function verify_status( args, done ) {
    verifyMonitorMiteSuite( args.mite, args.suite )
    done()
  }


  start_monitor()


  seneca.add( {role: 'suite', cmd: 'run_once'}, runOnce )
  seneca.add( {role: 'suite', cmd: 'verify_status'}, verify_status )
}