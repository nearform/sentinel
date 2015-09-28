"use strict";

var http = require('http')

var express        = require('express')
var bodyParser     = require('body-parser')
var cookieParser   = require('cookie-parser')
var methodOverride = require('method-override')
var session        = require('express-session')

// create a seneca instance
var seneca = require('seneca')()

seneca.use('user')

seneca.use('auth', {})
seneca.use('local-auth')
seneca.use('mite')

var app = express()
app.enable('trust proxy')

app.use(cookieParser())
app.use(express.query())
app.use(bodyParser.urlencoded({extended: true}))
app.use(methodOverride())
app.use(bodyParser.json())

app.use(session({secret:'seneca'}))

app.use( seneca.export('web') )

loadModules()


function loadModules(){
  var server = http.createServer(app)
  server.listen( 3333 )
}

