"use strict"

module.exports = function( options ) {
  var seneca = this;
  var name = 'ClientCtrl'

  var entities = seneca.export( 'constants/entities' )

  function createClient( msg, response ) {
    var user = msg.req$.user.user

    msg.users = msg.users || []
    msg.users.push(user.id)

    entities.getEntity( 'client', seneca, msg ).save$( function( err, client ) {
      if( err ) {
        return response( null, {err: true, msg: err} )
      }

      response( null, {err: false, data: client.data$( false )} )
    } )
  }


  function list( msg, response ) {
    var user = msg.req$.user.user

    var q = {}

    q.users = {$in: [user.id]}

    entities.getEntity( 'client', seneca ).list$(q, function( err, clients ) {
      if( err ) {
        return response( null, {err: true, msg: err} )
      }

      if( !clients ) {
        clients = []
      }

      for( var i in clients ) {
        clients[i] = clients[i].data$( false )
      }

      response( null, {err: false, data: clients, count: clients.length} )
    } )
  }


  function load( msg, response ) {
    var client_id = msg.client_id
    entities.getEntity( 'client', seneca ).load$( {id: client_id}, function( err, client ) {
      if( err ) {
        return response( null, {err: true, msg: err} )
      }

      client = client ? client.data$( false ) : client

      response( null, {err: false, data: client} )
    } )
  }


  seneca
    .add( {role: name, cmd: 'createClient'}, createClient )
    .add( {role: name, cmd: 'updateClient'}, createClient )
    .add( {role: name, cmd: 'list'}, list )
    .add( {role: name, cmd: 'load'}, load )


  seneca.act( {role: 'web', use: {
    name: name,
    prefix: '/api/',
    pin: {role: name, cmd: '*'},
    map: {
      createClient:     { POST: true, alias: 'client'},
      updateClient:     { PUT : true, alias: 'client'},
      list:             { GET : true, alias: 'client'},
      load:             { GET : true, alias: 'client/:client_id'}
    }
  }} )
}