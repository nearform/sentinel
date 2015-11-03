"use strict"

module.exports = function( options ) {
  var seneca = this;
  var name = 'constants'

  var entities = require( '../db/entities.js' )

  return {
    name: name,
    exportmap: {
      entities: entities,
      mite_status: {
        IDENTIFIED: 'identified',
        MONITORING: 'monitoring',
        NOT_CONNECTED: 'not_connected'
      }
    }
  }
}