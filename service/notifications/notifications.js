"use strict"

var _ = require( 'lodash' )

module.exports = function( options ) {
  var seneca = this;

  var entities = seneca.export( 'constants/entities' )

  function createDashboardNotification( args, done ) {
    seneca.log.debug('Create dashboard notification', args.message)
    var notification = {
      type: 'message',
      date: new Date(),
      message: args.message
    }
    entities.getEntity( 'notification', seneca, notification ).save$( done )
  }

  function createEmailNotification( args, done ) {
    seneca.log.debug('Create email notification', args.message, ' to', args.to)
    seneca.act( {
      role: 'mail',
      cmd: 'send',
      html: args.message,
      to: args.to,
      subject: args.subject
    }, done )
  }

  seneca
    .add( {role: 'notification', create: 'dashboard'}, createDashboardNotification )
    .add( {role: 'notification', send: 'email'}, createEmailNotification )
}