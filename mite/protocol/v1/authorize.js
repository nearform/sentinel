"use strict"

var uuid = require( 'node-uuid' )

module.exports = function( options ) {
  var seneca = this;
  var name = 'protocol_v1'

  // this should eventually be moved to another
  var token = uuid()


  function create_auth_token( args, done ) {
    token = uuid()

    done( null, {token: token} )
  }


  function get_auth_token( args, done ) {
    token = token

    done( null, {token: token} )
  }


  function authorize( args, done ) {
    if( !args.authorization ) {
      return done( null, {ok: false} )
    }

    var remote_token = args.authorization.token

    if( remote_token === token ) {
      return done( null, {ok: true} )
    }
    else {
      seneca.log.debug( 'Authorize rejected.', remote_token, token )
      return done( null, {ok: false} )
    }
  }


  seneca
    .add( {role: 'mite', create: 'auth_token'}, create_auth_token )
    .add( {role: 'mite', get: 'auth_token'}, get_auth_token )
    .add( {role: 'mite', authorize: 'command'}, authorize )
}