"use strict"

module.exports = function ( options ) {
  var name = 'NotificationCtrl'

  var entities = this.export( 'constants/entities' )


  function retrieve( msg, response ) {
    var mite_id = msg.mite_id
    var user = msg.req$.user.user

    var q = {}
    q.users = {$elemMatch: {id: user.id}}
    q['fields$'] = {id: true}

    entities.getEntity( 'mite', this ).list$(
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

        entities.getEntity( 'notification', this ).list$(
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


  this
    .add( {role: name, cmd: 'retrieve'}, retrieve )


  this.act( {role: 'web', use: {
    name:   name,
    prefix: '/api/',
    pin:    {role: name, cmd: '*'},
    map:    {
      retrieve: {GET: true, alias: 'notification'}
    }
  }} )
}