"use strict"

var _ = require( 'lodash' )

module.exports = function( options ) {
  var seneca = this;

  var entities = seneca.export( 'constants/entities' )

  function createDashboardNotification( args, done ) {
    var notification = {
      type: 'message',
      date: new Date(),
      message: args.message
    }
    entities.getEntity( 'notification', seneca, notification ).save$( done )
  }

  function createEmailNotification( args, done ) {
    return done()
    //not working email implementation - do not use it until is OK
    seneca.act( {
      role: 'mail',
      cmd: 'send',
      html: args.message,
      to: args.to,
      subject: 'Sentinel alarm'
    }, done )
  }

  seneca
    .add( {role: 'notification', create: 'dashboard'}, createDashboardNotification )
    .add( {role: 'notification', create: 'email'}, createEmailNotification )
}