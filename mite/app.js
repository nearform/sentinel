"use strict";

var http = require('http')

var express        = require('express')
var bodyParser     = require('body-parser')
var cookieParser   = require('cookie-parser')
var session        = require('express-session')

// create a seneca instance
var seneca = require('seneca')(/*{log: 'print'}*/)

seneca.use('user')

seneca.use('auth', {restrict: '/api'})
seneca.use('local-auth')
seneca.use('mite')

var app = express()
app.enable('trust proxy')

app.use(cookieParser())
app.use(express.query())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.use(session({secret:'seneca'}))

app.use( seneca.export('web') )


seneca
  .add( {role: 'test', cmd: 'service1'}, function(msg, response) {
    return response(null, {err: false, data: {something: "else"}})
  } )

seneca.act( {role: 'web', use: {
  name: 'test',
  prefix: '/api/',
  pin: {role: 'test', cmd: '*'},
  map: {
    service1: {GET: true, alias: 'service1'}
  }
}} )



loadModules()


function loadModules(){
  var server = http.createServer(app)
  server.listen( 3333 )
}
