"use strict"

var zone = ''
var systemZone = 'sys'

//***********************************************************
//               ENTITIES IMPLEMENTATION
//***********************************************************

function getEntity( entity, seneca, ent ) {
  return seneca.make$( zone, entity, (ent || {}) );
}

function User( seneca, ent ) {
  return seneca.make$( systemZone, 'user', (ent || {}) )
}


module.exports.User = User
module.exports.getEntity = getEntity

