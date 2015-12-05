"use strict"

var request = require( 'request' )
var _ = require('lodash')

module.exports = function ( options ) {
  var name = 'transport'

  var entities = this.export( 'constants/entities' )

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
    this.log.debug('Sending mite command to', url, ' command ', command)

    var body = JSON.stringify( {command: command} )

    this.log('TRANSPORT sending request: ', {message: body, password: mite.key})

    v.act("role: 'crypt', encrypt: 'message'", {message: body, password: mite.key}, function(err, encrypt){
      var req_options = {
        url:     url,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({command: encrypt.message})
      }

      if (mite.insecure){
        req_options.rejectUnauthorized = false
      }
      request.post( req_options,
        function ( err, response, body ) {

          this.log('TRANSPORT receiving response: ', err, response, body)

          if ( err ) {
            return done( null, {err: true, msg: 'Cannot connect'} )
          }

          var resp
          try {
            resp = JSON.parse( body )
          } catch ( err ) {
            this.log.debug( 'Received unexpected response: ' + body )
            return done( null, {err: true, msg: 'Received unexpected response: ' + body} )
          }

          if (resp.err){
            this.log.debug( 'Received unexpected response: ' + body )
            return done( null, {err: true, msg: body} )
          }

          this.act("role: 'crypt', decrypt: 'message'", {message: resp.response, password: mite.key}, function(err, decrypt){
            resp = decrypt.message

            try {
              resp = JSON.parse( resp )
            } catch ( err ) {
              this.log.debug( 'Received unexpected response: ' + resp )
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

  this.add( {role: name, send: 'command'}, sendCommand )
}