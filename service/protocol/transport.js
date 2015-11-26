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
    seneca.log.debug('Sending mite command to', url, ' command ', command)

    var body = JSON.stringify( {command: command} )

    seneca.log('TRANSPORT sending request: ', {message: body, password: mite.key})

    seneca.act("role: 'crypt', encrypt: 'message'", {message: body, password: mite.key}, function(err, encrypt){
      request.post( {
          url:     url,
          headers: {
            "Content-Type": "application/json"
          },
          rejectUnauthorized: false,
          body: JSON.stringify({command: encrypt.message})
        },
        function ( err, response, body ) {

          seneca.log('TRANSPORT receiving response: ', err, response, body)

          if ( err ) {
            return done( null, {err: true, msg: 'Cannot connect'} )
          }

          var resp
          try {
            resp = JSON.parse( body )
          } catch ( err ) {
            seneca.log.debug( 'Received unexpected response: ' + body )
            return done( null, {err: true, msg: 'Received unexpected response: ' + body} )
          }

          if (resp.err){
            seneca.log.debug( 'Received unexpected response: ' + body )
            return done( null, {err: true, msg: body} )
          }

          seneca.act("role: 'crypt', decrypt: 'message'", {message: resp.response, password: mite.key}, function(err, decrypt){
            resp = decrypt.message

            try {
              resp = JSON.parse( resp )
            } catch ( err ) {
              seneca.log.debug( 'Received unexpected response: ' + resp )
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