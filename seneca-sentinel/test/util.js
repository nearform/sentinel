var assert = require( 'assert' )
var _ = require( 'lodash' )

exports.init = function( options, cb ) {

  var agent
  var request = require( 'supertest' )
  var express = require( 'express' )
  var cookieparser = require( 'cookie-parser' )
  var bodyparser = require( 'body-parser' )
  var session = require( 'express-session' )

  var si = require( 'seneca' )( {log: 'print'} )
  si.use( './../service/utility/crypt' )

  si.ready( function( err ) {
    if( err ) {
      return process.exit( !console.error( err ) );
    }

    var app = express()
    app.use( cookieparser() )
    app.use( bodyparser.json() )
    app.use( session( {secret: 'si', resave: true, saveUninitialized: true } ) )

    app.use( si.export( 'web' ) )

    agent = request( app )

    cb( null, agent, si )
  } )
}
