"use strict"

var request = require( 'request' )
var _ = require('lodash')

module.exports = function ( options ) {
  var seneca = this;
  var name = 'transport'

  var entities = seneca.export( 'constants/entities' )

  function sendCommand( args, done ) {
    var mite = args.mite
    var command = args.command
    var url = mite.protocol + '://' + mite.host + ':' + mite.port + '/'

    //@hack
    if ( command.command.type === 'identify' ) {
      url = url + 'mite/identify'
    }
    else {
      url = url + 'mite/v1/command'
    }

    var body = JSON.stringify( {command: command} )

    seneca.act("role: 'utility', encrypt: 'message'", {message: body, key: mite.key}, function(err, encrypt){
      request.post( {
          url:     url,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({command: encrypt.message})
        },
        function ( err, response, body ) {
          if ( err ) {
            return done( null, {err: true, msg: 'Cannot connect'} )
          }

          var resp
          try {
            resp = JSON.parse( body )
          } catch ( err ) {
            console.log( 'Received unexpected response: ' + body )
            return done( null, {err: true, msg: 'Received unexpected response: ' + body} )
          }

          if (resp.err){
            console.log( 'Received unexpected response: ' + body )
            return done( null, {err: true, msg: body} )
          }

          seneca.act("role: 'utility', decrypt: 'message'", {message: resp.response, key: mite.key}, function(err, decrypt){
            resp = decrypt.message

            try {
              resp = JSON.parse( resp )
            } catch ( err ) {
              console.log( 'Received unexpected response: ' + resp )
              return done( null, {err: true, msg: 'Received unexpected response: ' + resp} )
            }

            if ( resp.err ) {
              return done( null, {err: true, msg: resp.msg} )
            }
            if ( resp.error ) {
              return done( null, {err: true, msg: resp.error} )
            }
            done( null, _.extend({err: false}, resp) )
          } )
        }
      )
    })
  }

  seneca.add( {role: name, send: 'command'}, sendCommand )
}