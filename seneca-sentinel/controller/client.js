"use strict"

module.exports = function( options ) {
  var seneca = this;
  var name = 'ClientCtrl'

  var entities = seneca.export( 'constants/entities' )

  function createClient( msg, response ) {
    var user = msg.req$.user.user

    msg.users = msg.users || []
    msg.users.push({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      id: user.id
    })

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

    q.users = {$elemMatch: {id:user.id}}

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


  function invite( msg, response ) {
    var client_id = msg.client_id
    var invite_email = msg.email

    entities.getEntity( 'client', seneca ).load$( {id: client_id}, function( err, client ) {
      if( err ) {
        return response( null, {err: true, msg: err} )
      }

      if (!client){
        return response( null, {err: true, msg: 'Invalid client'} )
      }

      entities.User(seneca ).load$({email: invite_email}, function(err, user){
        if( err ) {
          return response( null, {err: true, msg: err} )
        }

        if (!user){
          return response( null, {err: true, msg: 'Invalid user email'} )
        }

        if ( !client.users ){
          client.users = []
        }

        for (var i in client.users){
          if (client.users[i].email === invite_email){
            return response( null, {err: true, msg: 'User already invited'} )
          }
        }

        client.users.push({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          id: user.id
        })

        client.save$(function(err, client){
          if( err ) {
            return response( null, {err: true, msg: err} )
          }

          client = client ? client.data$( false ) : client

          response( null, {err: false, data: client} )
        })
      })
    } )
  }


  seneca
    .add( {role: name, cmd: 'createClient'}, createClient )
    .add( {role: name, cmd: 'updateClient'}, createClient )
    .add( {role: name, cmd: 'list'}, list )
    .add( {role: name, cmd: 'load'}, load )
    .add( {role: name, cmd: 'invite'}, invite )


  seneca.act( {role: 'web', use: {
    name: name,
    prefix: '/api/',
    pin: {role: name, cmd: '*'},
    map: {
      createClient:     { POST: true, alias: 'client'},
      updateClient:     { PUT : true, alias: 'client'},
      list:             { GET : true, alias: 'client'},
      load:             { GET : true, alias: 'client/:client_id'},
      invite:           { PUT : true, alias: 'client/:client_id/invite'}
    }
  }} )
}