"use strict"

module.exports = function ( options ) {
  var seneca = this;
  var name = 'NotificationCtrl'

  var entities = seneca.export( 'constants/entities' )


  function retrieve( msg, response ) {
    var mite_id = msg.mite_id

    entities.getEntity( 'notification', seneca ).list$( {sort$: {date: -1}, limit$: 10}, function ( err, notifications ) {
      if ( err ) {
        return response( null, {err: true, msg: err} )
      }

      notifications = notifications || []
      for ( var i in notifications ) {
        notifications[i] = notifications[i].data$( false )
      }
      return response( null, {err: false, data: notifications} )
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