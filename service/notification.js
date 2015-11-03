"use strict"

module.exports = function( options ) {
  var seneca = this;
  var name = 'mite'

  var entities = seneca.export( 'constants/entities' )
  var status = seneca.export( 'constants/mite_status' )


  function notifyConnectError( args, done ) {
    var mite = args.mite
    if( mite.status === status.NOT_CONNECTED ) {
      // already notified
      return done()
    }
    var notification = {
      type: 'error',
      mite: {
        id: mite.id,
        name: mite.name
      },
      date: new Date(),
      message: 'Connection lost for application ' + mite.name
    }
    entities.getEntity( 'notification', seneca, notification ).save$( done )
  }


  function notifyConnectEstablished( args, done ) {
    var mite = args.mite

    if( mite.status === status.MONITORING ) {
      // already notified
      return done()
    }
    var notification = {
      type: 'message',
      mite: {
        id: mite.id,
        name: mite.name
      },
      date: new Date(),
      message: 'Connection established for application ' + mite.name
    }
    entities.getEntity( 'notification', seneca, notification ).save$( done )
  }


  seneca
    .add( {role: 'notification', notify: 'connect'}, notifyConnectEstablished )
    .add( {role: 'notification', notify: 'not_connect'}, notifyConnectError )
}