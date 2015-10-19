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

  function runOnce( args, done ) {
    var suite = args.suite
    var mite = args.mite
    var suite_context = {}

    suite_context = {
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
        start:      suite_context.start,
        operations: []
      } ).save$( function ( err, monitor_context ) {

        if ( err ) {
          return
        }

        async.eachSeries( suite.urls, runTestUrl, function ( err, results ) {

          monitor_context.end = new Date()

          monitor_context.validated = true
          for ( var i in monitor_context.operations ) {
            if ( !monitor_context.operations[i].validated ) {
              monitor_context.validated = false
            }
          }

//          seneca.act( "role: 'alarm', notify:'data'", { mite_id: test.mite_id, data: { data_type: "suite_status", value: test.validated } } )

          monitor_context.save$( function ( err ) {
            entities.getEntity( 'mite', seneca ).load$( {id: mite.id}, function ( err, mite ) {
              if ( err ) {
                return
              }

              mite.last_connect_time = monitor_context.end
              mite.suites_validated = true

              for ( var i in mite.suites ) {

                // found current suite, update its status
                if ( mite.suites[i].id === suite.id ) {
                  mite.suites[i].last_test_date = monitor_context.end
                  mite.suites[i].validated = monitor_context.validated
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

      prepareRequest( mite, urlConfig, function ( err, request_data ) {
        if ( err ) {
          return done( err )
        }

        sendRequest( request_data, function ( err, test_context ) {
          test_context.start = begin
          test_context.err = err

          if ( err ) {
            var http_status = "N/A"
            if ( err.code ) {
              http_status = err.code
            }

            test_context.validated = false

            saveStatusData( test_context )
            if ( urlConfig.stop_on_error ) {
              // stop next tests
              return done( err )
            }
            else {
              return done()
            }
          }

          var response = test_context.response
          var http_response = test_context.http_response
          test_context.statusCode = http_response ? http_response.statusCode : "N/A"

          validateResponse( response, function ( validate_result ) {
            test_context.validate = validate_result

            if ( validate_result.err ) {
              test_context.validated = false

              saveStatusData( test_context )
              if ( urlConfig.stop_on_error ) {
                // stop next tests
                return done( validate_result.err )
              }
              else {
                return done()
              }
            }
            else {
              test_context.validated = true

              // extract variables
              // save them in test context for UI and also in suite context for next requests
              test_context.variables = extractVariables( response ) || []
              for ( var i in test_context.variables ) {
                if ( test_context.variables[i].valid ) {
                  suite_context.variables[test_context.variables[i].name] = test_context.variables[i].value
                }
              }

              saveStatusData( test_context )

              done()
            }
          } )
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


      function saveStatusData( operation ) {
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
        operation_data.process_error = operation.process_error
        operation_data.statusCode = operation.statusCode || "N/A"

        suite_context.operations.push( operation_data )

        if ( operation_data.validated ) {
          seneca.act( "role: 'documentation', update:'api'", {operation_data: operation_data, urlConfig: urlConfig, mite_id: mite.id} )
        }
      }


      function validateResponse( response, done ) {
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
              return done( {err: true, msg: err.message || err, scheme: scheme} )
            }
            done( {err: false, msg: 'Validated.', scheme: scheme} )
          } )

        }
        else {
          done( {err: false, msg: 'No validation scheme set.', scheme: 'N/A'} )
        }
      }
    }


    function replaceVariables( body ) {
      for ( var name in suite_context.variables ) {

        var re = new RegExp( '<<' + name + '>>', "g" );
        var value = suite_context.variables[name]
        if ( _.isObject( value ) ||
          _.isArray( value ) ) {
          value = JSON.stringify( value )
        }
        body = body.replace( re, value )
      }
      return body
    }


    function prepareRequest( mite, urlConfig, done ) {
      var method = urlConfig.method.toLowerCase()
      var url = mite.protocol + "://" + mite.host + ":" + mite.port + urlConfig.url

      // validate req_body
      var req_body = urlConfig.request

      url = replaceVariables( url )

      var req = {
        url: url
      }
      if ( req_body ) {
        req_body = replaceVariables( req_body )
        try {
          req_body = JSON.parse( req_body )
        }
        catch ( err ) {
          return done( null, {
            url:           url,
            process_error: 'Cannot parse body as JSON, aborting... Error message: ' + err + ". Body: " + req_body
          } )
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
          return done( null, {
            url:           url,
            process_error: 'Cannot parse extended body as JSON, aborting... Error message: ' + err + ". Body: " + ext
          } )
        }

        if ( ext ) {
          req_body = _.extend( req_body, ext )
        }
      }

      req.headers = {"Content-Type": "application/json"}
      req.body = JSON.stringify( req_body )

      var response_data = {
        url:      url,
        req_body: req_body
      }

      if ( urlConfig.authorized && suite_context.cookie ) {
        var cookie_str = 'seneca-login' + '=' + suite_context.cookie
        response_data.auth_token = cookie_str


        var j = request.jar();
        var cookie = request.cookie( cookie_str )
        j.setCookie( cookie, url );
        req.jar = j
      }
      return done( null, {
        method: method,
        req:    req
      } )
    }

    function sendRequest( args, done ) {

      var method = args.method
      var req = args.req

      request[method]( req,
        function ( err, response, body ) {

          var response_data = {
            url:      req.url,
            req_body: req.body
          }

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
              suite_context.cookie = cookie_value.split( ';' )[0]
              break
            }

          }
        }
      }
    }
  }

  function replay_request( args, done ) {
    var test_id = args.test_id
    var suite_id = args.suite_id
    var url = args.url
    done()
  }


  seneca
    .add( {role: 'suite', cmd: 'run_once'}, runOnce )
    .add( {role: 'suite', replay: 'request'}, replay_request )
}