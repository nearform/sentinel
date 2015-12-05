"use strict"

module.exports = function( options ) {
  var entities = this.export( 'constants/entities' )
  var status = this.export( 'constants/mite_status' )


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
    entities.getEntity( 'notification', this, notification ).save$( done )
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
    entities.getEntity( 'notification', this, notification ).save$( done )
  }


  this
    .add( {role: 'notification', notify: 'connect'}, notifyConnectEstablished )
    .add( {role: 'notification', notify: 'not_connect'}, notifyConnectError )
}