"use strict";

var assert = require( 'assert' )
var agent

var Lab = require( 'lab' )
var lab = exports.lab = Lab.script()
var suite = lab.suite;
var test = lab.test;
var before = lab.before;
var after = lab.after;

var util = require( './util.js' )

var auth_token

suite( 'init stage suite tests ', function() {
  before( {}, function( done ) {
    util.init( {}, function( err, agentData ) {
      agent = agentData
      done()
    } )
  } )

  test( 'test identify command', function( done ) {
    agent
      .post( '/mite/identify' )
      .expect( 200 )
      .end( function( err, res ) {
        util.log( res )
        assert( res.body.authorize.token, 'Token OK' )
        assert.equal( res.body.execution.code, "000", 'execution code OK' )
        assert.equal( res.body.payload.protocol_version, 1, 'protocol version OK' )
        auth_token = res.body.authorize.token
        done( err )
      } )
  } )

  test( 'test invalid configuration command', function( done ) {
    agent
      .post( '/mite/v1/command' )
      .send(
      {
        command: {
          authorization: {
            token: auth_token
          },
          command: {
            type: 'configuration'
          },
          payload: {}
        }
      } )
      .expect( 200 )
      .end( function( err, res ) {
        util.log( res )
        assert( res.body.authorize.token, 'Token OK' )
        assert.equal( res.body.execution.code, "200", 'execution code 200' )
        done( err )
      } )
  } )

  test( 'test valid configuration command', function( done ) {
    agent
      .post( '/mite/v1/command' )
      .send(
      {
        command: {
          authorization: {
            token: auth_token
          },
          command: {
            type: 'configuration'
          },
          payload: {
            max_samples: 10,
            rate_interval: 60
          }
        }
      } )
      .expect( 200 )
      .end( function( err, res ) {
        util.log( res )
        assert( res.body.authorize.token, 'Token OK' )
        assert.equal( res.body.execution.code, "000", 'execution code 000' )
        done( err )
      } )
  } )

  test( 'test get status command', function( done ) {
    agent
      .post( '/mite/v1/command' )
      .send(
      {
        command: {
          authorization: {
            token: auth_token
          },
          command: {
            type: 'getStatus'
          },
          payload: {
          }
        }
      } )
      .expect( 200 )
      .end( function( err, res ) {
        util.log( res )
        assert( res.body.authorize.token, 'Token OK' )
        assert.equal( res.body.execution.code, "000", 'execution code 000' )
        done( err )
      } )
  } )

  test( 'test get status command with invalid token', function( done ) {
    agent
      .post( '/mite/v1/command' )
      .send(
      {
        command: {
          authorization: {
            token: 'INVALID_TOKEN'
          },
          command: {
            type: 'getStatus'
          },
          payload: {
          }
        }
      } )
      .expect( 200 )
      .end( function( err, res ) {
        util.log( res )
        assert.equal( res.body.execution.code, "100", 'execution code 100' )
        done( err )
      } )
  } )


  test( 'test configuration command with invalid token', function( done ) {
    agent
      .post( '/mite/v1/command' )
      .send(
      {
        command: {
          authorization: {
            token: 'INVALID_TOKEN'
          },
          command: {
            type: 'configuration'
          },
          payload: {
          }
        }
      } )
      .expect( 200 )
      .end( function( err, res ) {
        util.log( res )
        assert.equal( res.body.execution.code, "100", 'execution code 100' )
        done( err )
      } )
  } )

  test( 'test invalid command type', function( done ) {
    agent
      .post( '/mite/v1/command' )
      .send(
      {
        command: {
          authorization: {
            token: auth_token
          },
          command: {
            type: 'INVALID_COMMAND_TYPE'
          },
          payload: {
          }
        }
      } )
      .expect( 200 )
      .end( function( err, res ) {
        util.log( res )
        assert.equal( res.body.execution.code, "401", 'execution code 100' )
        done( err )
      } )
  } )

} )




