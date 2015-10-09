"use strict"

var _ = require( 'lodash' )
var async = require( 'async' )
var request = require( 'request' )
var uuid = require( 'node-uuid' )
var parambulator = require( 'parambulator' )

module.exports = function ( options ) {
  var seneca = this;

  var entities = seneca.export( 'constants/entities' )
  var mite_status = seneca.export( 'constants/mite_status' )
  var monitor_context = {}
  var monitor_ids = {}

  function runOnce( args, done ) {
    var suite = args.suite
    var mite = args.mite

    if ( monitor_context[mite.id] && monitor_context[mite.id][suite.id] && monitor_context[mite.id][suite.id].running ) {
      return done( null, {err: true, msg: 'Suite test in progress, cannot run another test instance'} )
    }

    if ( !monitor_context[mite.id] ) {
      monitor_context[mite.id] = {}
    }

    monitor_context[mite.id][suite.id] = {
      running:    true,
      start:      new Date(),
      operations: [],
      variables:  {},
      validated:  true
    }

    // callback call - test will run in background
    done()

    entities.getEntity(
      'suite_test',
      seneca,
      {
        mite_id:    mite.id,
        name:       suite.name,
        suite_id:   suite.id,
        start:      monitor_context[mite.id][suite.id].start,
        operations: []
      } ).save$( function ( err, test ) {

        if ( err ) {
          monitor_context[mite.id][suite.id].running = false
          return
        }
        console.log( 'run test suite' + suite.name )

        async.eachSeries( suite.urls, runTestUrl, function ( err, results ) {
          var data = monitor_context[mite.id][suite.id]
          var context = monitor_context[mite.id][suite.id]
          test.operations = data.operations
          test.end = new Date()

          monitor_context[mite.id][suite.id] = {}

          test.validated = true
          for ( var i in test.operations ) {
            if ( !test.operations[i].validated ) {
              test.validated = false
            }
          }

          test.save$( function ( err ) {
            entities.getEntity( 'mite', seneca ).load$( {id: mite.id}, function ( err, mite ) {
              if ( err ) {
                return
              }

              mite.last_connect_time = test.end
              mite.suites_validated = true
              for ( var i in mite.suites ) {
                if ( mite.suites[i].id === suite.id ) {
                  mite.suites[i].last_test_date = test.end
                  mite.suites[i].validated = test.validated
                }
                if ( !mite.suites[i].validated ) {
                  mite.suites_validated = false
                }
              }

              mite.save$( function () {
              } )
            } )
          } )
        } )
      } )


    function runTestUrl( urlConfig, done ) {

      var begin = new Date()
      console.log( 'run ' + urlConfig.url )

      sendRequest( mite, urlConfig, function ( err, data ) {

        var response = data.response
        var http_response = data.http_response
        var url = data.url
        data.start = begin
        data.err = err

        if ( err ) {
          var http_status = "N/A"
          if ( err.code ) {
            http_status = err.code
          }

          data.validated = false
          addOperationData( data )
          if ( urlConfig.stop_on_error ) {
            // stop next tests
            return done( err )
          }
          else {
            return done()
          }
        }

        validateResponse( response, urlConfig.validate_response, function ( validate_result ) {
          data.validate = validate_result

          if ( validate_result.err ) {
            data.validated = false

            addOperationData( data )
            if ( urlConfig.stop_on_error ) {
              // stop next tests
              return done( validate_result.err )
            }
            else {
              return done()
            }
          }
          else {
            data.validated = true

            data.variables = extractVariables( response )
            addOperationData( data )

            done()
          }
        } )
      } )

      function extractVariables( response ) {
        var variables = []
        if ( !urlConfig.variables ) {
          return variables
        }

        for ( var i in urlConfig.variables ) {
          var variable = urlConfig.variables[i]
          variables.push( extractVariable( variable ) )
        }

        return variables


        function extractVariable( variable ) {
          var variable_data = {
            name:     variable.name,
            property: variable.property,
            valid:    false
          }

          var tokens = variable.property.split( "." )
          var data = response
          var value
          for ( var j in tokens ) {
            if ( _.has( data, tokens[j] ) ) {
              value = data[tokens[j]]
              data = data[tokens[j]]
            }
            else {
              variable_data.message = "Cannot extract variable " + variable.name + ' missing ' + tokens[j] + ' key.'
              console.log( variable_data.message )
              return variable_data
            }
          }

          variable_data.valid = true
          variable_data.value = value
          console.log( "Extracted variable", variable.name, value )
          return variable_data
        }
      }


      function addOperationData( operation ) {
        var operation_data = {}

        operation_data.validated = operation.validated

        operation_data.request = {}
        if ( urlConfig.request ) {
          operation_data.request.body = operation.req_body
        }
        operation_data.request.auth_token = operation.auth_token
        operation_data.response = operation.response

        operation_data.start = operation.start
        operation_data.end = new Date()
        operation_data.url = operation.url
        operation_data.err = operation.err
        operation_data.validate = operation.validate
        operation_data.variables = operation.variables

        if ( operation_data.variables && operation_data.variables.length ) {
          for ( var i in operation_data.variables ) {
            if ( operation_data.variables[i].valid ) {
              monitor_context[mite.id][suite.id].variables[operation_data.variables[i].name] = operation_data.variables[i].value
            }
          }
        }

        monitor_context[mite.id][suite.id].operations.push( operation_data )
      }


      function validateResponse( response, validate_response, done ) {
        if ( urlConfig.validate_response ) {

          var scheme
          try {
            scheme = JSON.parse( urlConfig.validate_response )
          }
          catch ( err ) {
            return done( {err: false, msg: 'Invalid parambulator scheme.', scheme: urlConfig.validate_response} )
          }
          var paramcheck = parambulator( scheme )
          paramcheck.validate( response, function ( err ) {
            if ( err ) {
              return done( {err: true, msg: err.message || err, scheme: urlConfig.validate_response} )
            }
            done( {err: false, msg: 'Validated.', scheme: urlConfig.validate_response} )
          } )

        }
        else {
          done( {err: false, msg: 'No validation scheme set.', scheme: 'N/A'} )
        }
      }
    }


    function replaceVariables( body ) {
      for ( var name in monitor_context[mite.id][suite.id].variables ) {
        var re = new RegExp('<<' + name + '>>',"g");
        body = body.replace( re, JSON.stringify(monitor_context[mite.id][suite.id].variables[name]) )
      }
      return body
    }


    function sendRequest( mite, urlConfig, done ) {
      var method = urlConfig.method.toLowerCase()
      var url = mite.protocol + "://" + mite.host + ":" + mite.port + urlConfig.url

      // validate req_body
      var req_body = urlConfig.request

      var req = {
        url: url
      }
      if ( req_body ) {
        req_body = replaceVariables( req_body )
        try {
          req_body = JSON.parse( req_body )
        }
        catch ( err ) {
          return done( err, {url: url} )
        }

        req.headers = {"Content-Type": "application/json"}
        req.body = JSON.stringify( req_body )
      }

      var ext
      if ( urlConfig.extend ) {
        ext = replaceVariables( urlConfig.extend )
        try {
          ext = JSON.parse( ext )
        }
        catch ( err ) {
          ext = undefined
        }

        if (ext){
          req_body = _.extend(req_body, ext)
        }
      }

      req.headers = {"Content-Type": "application/json"}
      req.body = JSON.stringify( req_body )

      var response_data = {
        url: url,
        req_body: req_body
      }

      if ( urlConfig.authorized && monitor_context[mite.id][suite.id].cookie ) {
        var cookie_str = 'seneca-login' + '=' + monitor_context[mite.id][suite.id].cookie
        response_data.auth_token = cookie_str


        var j = request.jar();
        var cookie = request.cookie( cookie_str )
        j.setCookie( cookie, url );
        req.jar = j
      }

      request[method]( req,
        function ( err, response, body ) {
          response_data.response = body
          response_data.http_response = response

          if ( err ) {
            return done( err, response_data )
          }

          try {
            response_data.response = JSON.parse( body )
          }
          catch ( err ) {
            console.log( 'Received unexpected response: ' + body )
          }

          if ( 200 != response.statusCode ) {
            // just try to parse response, maybe....
            return done( 'Status Code: ' + response.statusCode, response_data )
          }

          // get auth-cookie - if exists
          set_auth_cookie( response )


          return done( err, response_data )
        }
      )
    }

    function set_auth_cookie( response ) {
      if ( response.headers && response.headers['set-cookie'] ) {

        for ( var i in response.headers['set-cookie'] ) {
          var cookie_str = response.headers['set-cookie'][i]
          var index = cookie_str.indexOf( '=' )
          if ( index > 0 ) {
            var cookie_name = cookie_str.substr( 0, index )
            var cookie_value = cookie_str.substr( index + 1 )
            if ( cookie_name === 'seneca-login' ) {
              monitor_context[mite.id][suite.id].cookie = cookie_value.split( ';' )[0]
              break
            }

          }
        }
      }
    }
  }

  function start_monitor() {
    entities.getEntity( 'mite', seneca ).list$( {}, function ( err, mites ) {
      if ( err ) {
        return
      }
      mites = mites || []

      _.each( mites, function ( mite ) {
        mite.suites = mite.suites || []
        _.each( mite.suites, function ( suite ) {
          verifyMonitorMiteSuite( mite, suite )
        } )
      } )
    } )
  }


  function verifyMonitorMiteSuite( mite, suite ) {
    if ( suite.monitoring ) {
      var interval = (suite.monitor_interval ? ( suite.monitor_interval || 60 * 10 ) : 60 * 10) * 1000

      monitor_ids['suite' + suite.id] = {
        started:    true,
        monitor_id: setInterval( function () {
          var suite_id = suite.id
          var mite_id = mite.id
          monitorSuite( mite_id, suite_id )
        }, interval ),
        mite_id:    mite.id,
        suite_id:   suite.id
      }
    }
    else {
      if ( monitor_ids['suite' + suite.id] ) {
        var monitor_id = monitor_ids['suite' + suite.id].monitor_id
        if ( monitor_id ) {
          clearInterval( monitor_id );
        }
        delete monitor_ids['suite' + suite.id]
      }
    }
  }


  function monitorSuite( mite_id, suite_id ) {
    entities.getEntity( 'mite', seneca ).load$( {id: mite_id}, function ( err, mite ) {
      if ( err ) {
        return
      }
      if ( !mite ) {
        return
      }

      for ( var i in mite.suites ) {
        if ( mite.suites[i].id === suite_id ) {
          seneca.act( "role: 'suite', cmd: 'run_once'", {mite: mite, suite: mite.suites[i]}, function ( err ) {
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