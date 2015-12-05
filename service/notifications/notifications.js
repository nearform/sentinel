"use strict"

var _ = require( 'lodash' )

module.exports = function( options ) {
  var entities = this.export( 'constants/entities' )

  function createDashboardNotification( args, done ) {
    this.log.debug('Create dashboard notification', args.message)
    var notification = {
      type: 'message',
      date: new Date(),
      message: args.message
    }
    entities.getEntity( 'notification', this, notification ).save$( done )
  }

  function createEmailNotification( args, done ) {
    this.log.debug('Create email notification', args.message, ' to', args.to)
    this.act( {
      role: 'mail',
      cmd: 'send',
      html: args.message,
      to: args.to,
      subject: args.subject
    }, done )
  }

  this
    .add( {role: 'notification', create: 'dashboard'}, createDashboardNotification )
    .add( {role: 'notification', send: 'email'}, createEmailNotification )
}