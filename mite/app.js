"use strict";

var http = require( 'http' )

var express = require( 'express' )
var bodyParser = require( 'body-parser' )
var cookieParser = require( 'cookie-parser' )
var session = require( 'express-session' )

// create a seneca instance
var seneca = require( 'seneca' )( /*{log: 'print'}*/ )

seneca.use( 'user' )

seneca.use( 'auth', {restrict: '/api'} )
seneca.use( 'local-auth' )
seneca.use( 'mite' )

var app = express()
app.enable( 'trust proxy' )

app.use( cookieParser() )
app.use( express.query() )
app.use( bodyParser.urlencoded( {extended: true} ) )
app.use( bodyParser.json() )

app.use( session( {secret: 'seneca'} ) )

app.use( seneca.export( 'web' ) )


// add some test services
var test_data = [
  {id: "0",
    value: 5},
  {id: "1",
    value: 53},
  {id: "2",
    value: 54},
  {id: "3",
    value: 55},
  {id: "4",
    value: 56}
]
seneca
  .add( {role: 'test', cmd: 'testDataList'}, function( msg, response ) {
    return response( null, {err: false, data: test_data} )
  } )

seneca
  .add( {role: 'test', cmd: 'testDataItem'}, function( msg, response ) {
    var id = msg.id
    if( !id ) {
      return response( null, {err: true, msg: 'wrong id'} )
    }

    for( var i in test_data ) {
      if( test_data[i].id == id ) {
        return response( null, {err: false, data: test_data[i]} )
      }
    }
    return response( null, {err: false} )
  } )

seneca
  .add( {role: 'test', cmd: 'testDataItem2'}, function( msg, response ) {
    var id = msg.id
    if( !id ) {
      return response( null, {err: true, msg: 'wrong id'} )
    }

    for( var i in test_data ) {
      if( test_data[i].id == id ) {
        return response( null, {err: false, data: test_data[i]} )
      }
    }
    return response( null, {err: false} )
  } )

seneca.act( {role: 'web', use: {
  name: 'test',
  prefix: '/api/',
  pin: {role: 'test', cmd: '*'},
  map: {
    testDataList: {GET: true, alias: 'data'},
    testDataItem: {GET: true, POST: true, alias: 'data/:id'},
    testDataItem2:{GET: true, alias: 'data/:id/something/else'}
  }
}} )


loadModules()


function loadModules() {
  var server = http.createServer( app )
  server.listen( 3333 )
}
