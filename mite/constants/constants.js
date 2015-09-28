"use strict"

module.exports = function ( options ) {
  var seneca = this;
  var name = 'constants'
  var protocol_version = '1'

  return {
    name:      name,
    exportmap: {
      protocol_version: protocol_version
    }
  }
}