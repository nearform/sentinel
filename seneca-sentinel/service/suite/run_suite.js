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

  function runOnce( args, done ) {
    var suite = args.suite
    var mite = args.mite

    var suite_context = {
      mite_id: mite.id,
      name: suite.name,
      suite_id: suite.id,
      start: new Date(),
      operations: [],
      variables: {},
      validated: true
    }

    // callback call - test will run in background
    done()

    entities.getEntity( 'suite_test', seneca, suite_context ).save$( function( err, suite_context ) {
      if( err ) {
        return
      }

      var lst = []
      for( var i in suite.urls ) {
        lst.push( {
          suite_context: suite_context,
          url: suite.urls[i],
          mite: mite
        } )
      }

      async.eachSeries( lst, runTestUrl, function( err, results ) {

        suite_context.end = new Date()

        suite_context.validated = true
        for( var i in suite_context.operations ) {
          if( !suite_context.operations[i].validated ) {
            suite_context.validated = false
          }
        }

//          seneca.act( "role: 'alarm', notify:'data'", { mite_id: test.mite_id, data: { data_type: "suite_status", value: test.validated } } )

        suite_context.save$( function( err ) {
          entities.getEntity( 'mite', seneca ).load$( {id: mite.id}, function( err, mite ) {
            if( err ) {
              return
            }

            mite.last_connect_time = suite_context.end
            mite.suites_validated = true

            for( var i in mite.suites ) {

              // found current suite, update its status
              if( mite.suites[i].id === suite.id ) {
                mite.suites[i].last_test_date = suite_context.end
                mite.suites[i].validated = suite_context.validated
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
  }

  function runTestUrl( context, done ) {
    var suite_context = context.suite_context
    var urlConfig = context.url
    var mite = context.mite

    var request = context.request

    if( request ) {
      request.suite_context = suite_context
      sendRequest( request, function( err, test_context ) {
        processResponse( suite_context, err, test_context, done )
      } )
    }
    else {
      prepareRequest( suite_context, mite, urlConfig, function( err, request_data ) {
        if( err ) {
          return done( err )
        }
        if (request_data.process_error){
          return done( err )
        }

        request_data.suite_context = suite_context
        sendRequest( request_data, function( err, test_context ) {
          processResponse( suite_context, err, test_context, done )
        } )
      } )
    }

    function processResponse( suite_context, err, test_context, done ) {
      test_context.err = err

      if( err ) {
        var http_status = "N/A"
        if( err.code ) {
          http_status = err.code
        }

        test_context.validated = false

        saveStatusData( suite_context, test_context )
        if( urlConfig.stop_on_error ) {
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

      validateResponse( response, function( validate_result ) {
        test_context.validate = validate_result

        if( validate_result.err ) {
          test_context.validated = false

          saveStatusData( suite_context, test_context )
          if( urlConfig.stop_on_error ) {
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
          console.log(test_context.variables)
          for( var i in test_context.variables ) {
            if( test_context.variables[i].valid ) {
              suite_context.variables[test_context.variables[i].name] = test_context.variables[i].value
            }
          }

          saveStatusData( suite_context, test_context )

          done()
        }
      } )
    }


    function extractVariables( response ) {

      var variables = []
      if( !urlConfig.variables ) {
        return variables
      }

      for( var i in urlConfig.variables ) {
        var variable = urlConfig.variables[i]
        if ('<<random_number>>' === variable.property){
          variables.push({
            name: variable.name,
            property: variable.property,
            valid: true,
            value: genNumber()
          })
        }
        else if ('<<random_string>>' === variable.property){
          variables.push({
            name: variable.name,
            property: variable.property,
            valid: true,
            value: genString()
          })
        }
        else{
          variables.push( extractVariable( variable ) )
        }
      }

      return variables


      function extractVariable( variable ) {
        var variable_data = {
          name: variable.name,
          property: variable.property,
          valid: false
        }

        var tokens = variable.property.split( "." )
        var data = response
        var value
        for( var j in tokens ) {
          if( _.has( data, tokens[j] ) ) {
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


    function saveStatusData( suite_context, test_context ) {
      var operation_data = {}

      operation_data.validated = test_context.validated

      operation_data.request = {}
      operation_data.request.body = test_context.req_body
      operation_data.request.req = test_context.req
      operation_data.request.method = test_context.method

      operation_data.request.auth_token = test_context.auth_token
      operation_data.response = test_context.response

      operation_data.start = test_context.begin
      operation_data.end = test_context.end
      operation_data.url = test_context.url
      operation_data.err = test_context.err
      operation_data.validate = test_context.validate
      operation_data.variables = test_context.variables
      operation_data.process_error = test_context.process_error
      operation_data.statusCode = test_context.statusCode || "N/A"

      suite_context.operations.push( operation_data )

      if( operation_data.validated ) {
        seneca.act( "role: 'documentation', update:'api'", {operation_data: operation_data, urlConfig: urlConfig, mite_id: mite.id} )
      }
    }


    function validateResponse( response, done ) {
      if( urlConfig.validate_response ) {

        var scheme = replaceVariables( suite_context, urlConfig.validate_response )

        try {
          scheme = JSON.parse( scheme )
        }
        catch( err ) {
          return done( {err: false, msg: 'Invalid parambulator scheme.', scheme: urlConfig.validate_response} )
        }

        var paramcheck = parambulator( scheme )
        paramcheck.validate( response, function( err ) {
          if( err ) {
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


  function replaceVariables( suite_context, body ) {
    for( var name in suite_context.variables ) {

      var re = new RegExp( '<<' + name + '>>', "g" );
      var value = suite_context.variables[name]
      if( _.isObject( value ) ||
        _.isArray( value ) ) {
        value = JSON.stringify( value )
      }
      body = body.replace( re, value )
    }
    return body
  }


  function prepareRequest( suite_context, mite, urlConfig, done ) {
    var method = urlConfig.method.toLowerCase()
    var url = mite.protocol + "://" + mite.host + ":" + mite.port + urlConfig.url

    // validate req_body
    var req_body = urlConfig.request

    url = replaceVariables( suite_context, url )

    var req = {
      url: url
    }
    if( req_body ) {
      req_body = replaceVariables( suite_context, req_body )
      try {
        req_body = JSON.parse( req_body )
      }
      catch( err ) {
        return done( null, {
          url: url,
          process_error: 'Cannot parse body as JSON, aborting... Error message: ' + err + ". Body: " + req_body
        } )
      }

      req.headers = {"Content-Type": "application/json"}
      req.body = JSON.stringify( req_body )
    }

    var ext
    if( urlConfig.extend ) {
      ext = replaceVariables( suite_context, urlConfig.extend )
      try {
        ext = JSON.parse( ext )
      }
      catch( err ) {
        return done( null, {
          url: url,
          process_error: 'Cannot parse extended body as JSON, aborting... Error message: ' + err + ". Body: " + ext
        } )
      }

      if( ext ) {
        req_body = _.extend( req_body, ext )
      }
    }

    req.headers = {"Content-Type": "application/json"}
    req.body = JSON.stringify( req_body )

    var test_context = {
      url: url,
      req_body: req_body
    }

    if( urlConfig.authorized && suite_context.cookie ) {
      var cookie_str = 'seneca-login' + '=' + suite_context.cookie
      test_context.auth_token = cookie_str


      var j = request.jar();
      var cookie = request.cookie( cookie_str )
      j.setCookie( cookie, url );
      req.jar = j
    }
    return done( null, {
      method: method,
      req: req,
      test_context: test_context
    } )
  }


  function sendRequest( args, done ) {

    var method = args.method
    var req = args.req
    var suite_context = args.suite_context
    var test_context = args.test_context

    test_context.begin = new Date()

    request[method]( req,
      function( err, response, body ) {

        test_context.end = new Date()

        test_context.response = body
        test_context.http_response = response
        test_context.req = req
        test_context.method = method

        if( err ) {
          return done( err, test_context )
        }

        try {
          test_context.response = JSON.parse( body )
        }
        catch( err ) {
          console.log( 'Received unexpected response: ' + body )
        }

        if( 200 != response.statusCode ) {
          // just try to parse response, maybe....
          return done( 'Status Code: ' + response.statusCode, test_context )
        }

        // get auth-cookie - if exists
        set_auth_cookie( suite_context, response )


        return done( err, test_context )
      }
    )
  }


  function set_auth_cookie( suite_context, response ) {
    if( response.headers && response.headers['set-cookie'] ) {

      for( var i in response.headers['set-cookie'] ) {
        var cookie_str = response.headers['set-cookie'][i]
        var index = cookie_str.indexOf( '=' )
        if( index > 0 ) {
          var cookie_name = cookie_str.substr( 0, index )
          var cookie_value = cookie_str.substr( index + 1 )
          if( cookie_name === 'seneca-login' ) {
            suite_context.cookie = cookie_value.split( ';' )[0]
            break
          }

        }
      }
    }
  }


  function replay_request( args, done ) {
    var test_id = args.test_id
    var suite_id = args.suite_id
    var url = args.url

    entities.getEntity('suite_test', seneca ).load$({id: test_id}, function(err, test){
      if (err){
        return done(err)
      }

      if (!test){
        return done('Invalid test selected')
      }

      var found = false
      for (var i in test.operations){
        if (test.operations[i].request.req.url === url){
          found = true

          var req = test.operations[i].request.req
          delete req.jar
          var test_context = {}

          if( test.operations[i].request.auth_token ) {
            var cookie_str = 'seneca-login' + '=' + test.operations[i].request.auth_token
            test_context.auth_token = cookie_str

            var j = request.jar();
            var cookie = request.cookie( cookie_str )
            j.setCookie( cookie, url );
            req.jar = j
          }

          var context = {
            method : test.operations[i].request.method,
            req : req,
            suite_context : {},
            test_context : test_context
          }

          sendRequest( context, function(err, test_context){
            console.log('******************************', err, test_context)
            done()
          } )
          return
        }
      }

      if (!found){
        done("Test url not found")
      }
    })
  }

  function genNumber(){
    var high = 100000
    var low = 0
    return Math.floor(Math.random() * (high - low) + low)
  }

  function genString(){
    var len = 8
    var dict = "abcdefghjkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ";

    var str = "";
    for (var i = 0; i < len; i++) {
      str += dict.charAt(Math.floor(Math.random() * dict.length))
    }
    return str
  }


  seneca
    .add( {role: 'suite', cmd: 'run_once'}, runOnce )
    .add( {role: 'suite', replay: 'request'}, replay_request )
}