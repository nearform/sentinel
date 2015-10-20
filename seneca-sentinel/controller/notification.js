"use strict"

module.exports = function ( options ) {
  var seneca = this;
  var name = 'NotificationCtrl'

  var entities = seneca.export( 'constants/entities' )


  function retrieve( msg, response ) {
    var mite_id = msg.mite_id
    var user = msg.req$.user.user

    var q = {}
    q.users = {$elemMatch: {id: user.id}}
    q['fields$'] = {id: true}

    entities.getEntity( 'mite', seneca ).list$(
      q
      , function ( err, mites ) {
        if ( err ) {
          return response( null, {err: true, msg: err} )
        }

        var access_list = []
        for ( var i in mites ) {
          access_list.push(mites[i].id)
        }

        q = {
          sort$: {date: -1},
          limit$: 10,
          "mite.id": {$in: access_list}
        }

        entities.getEntity( 'notification', seneca ).list$(
          q, function ( err, notifications ) {
          if ( err ) {
            return response( null, {err: true, msg: err} )
          }

          notifications = notifications || []
          for ( var i in notifications ) {
            notifications[i] = notifications[i].data$( false )
          }
          return response( null, {err: false, data: notifications} )
        } )
      } )
  }


  seneca
    .add( {role: name, cmd: 'retrieve'}, retrieve )


  seneca.act( {role: 'web', use: {
    name:   name,
    prefix: '/api/',
    pin:    {role: name, cmd: '*'},
    map:    {
      retrieve: {GET: true, alias: 'notification'}
    }
  }} )
}