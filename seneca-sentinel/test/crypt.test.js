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

var seneca

suite( 'init stage suite tests ', function() {
  before( {}, function( done ) {
    util.init( {}, function( err, agent, si ) {
      seneca = si
      done()
    } )
  } )

  var message = 'Some message'
  test( 'crypt-decrypt with default', function( done ) {
    seneca.act( "role: 'utility', encrypt: 'message'", {message: message}, function( err, encrypt_msg ) {
      assert( !err )
      assert( encrypt_msg )

      seneca.act( "role: 'utility', decrypt: 'message'", {message: encrypt_msg.message}, function( err, msg ) {
        assert( !err )
        assert( msg )
        assert.equal( message, msg.message )
        done()
      } )
    } )
  } )

} )




