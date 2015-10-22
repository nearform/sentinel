"use strict"

var _ = require( 'lodash' )
var crypto = require( 'crypto' )

module.exports = function( options ) {
  var seneca = this;

  var algorithm = 'aes-256-ctr'
  var default_password = 'd6F3Efeq37554'

  function encrypt_message( args, done ) {
    var password = args.key || default_password
    var message = args.message

    var cipher = crypto.createCipher( algorithm, password )
    var crypted = cipher.update( message, 'utf8', 'hex' )
    crypted += cipher.final( 'hex' )
    done( null, {message: crypted} )
  }

  function decrypt_message( args, done ) {
    var password = args.key || default_password
    var message = args.message

    var decipher = crypto.createDecipher( algorithm, password )
    var dec = decipher.update( message, 'hex', 'utf8' )
    dec += decipher.final( 'utf8' )
    done( null, {message: dec} )
  }

  seneca
    .add( {role: 'utility', encrypt: 'message'}, encrypt_message )
    .add( {role: 'utility', decrypt: 'message'}, decrypt_message )
}