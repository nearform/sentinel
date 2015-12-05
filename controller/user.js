"use strict"

module.exports = function( options ) {
  var name = 'UserCtrl'

  var entities = this.export( 'constants/entities' )

  function list( msg, response ) {
    entities.User( this ).list$(
      {
        fields$: {
          id: true,
          firstName: true,
          lastName: true,
          admin: true,
          email: true
        }
      }, function( err, users ) {
      if( err ) {
        return response( null, {err: true, msg: err} )
      }

      if( !users ) {
        users = []
      }

      for( var i in users ) {
        users[i] = users[i].data$( false )
      }

      response( null, {err: false, data: users, count: users.length} )
    } )
  }

  this
    .add( {role: name, cmd: 'list'}, list )


  this.act( {role: 'web', use: {
    name: name,
    prefix: '/api/',
    pin: {role: name, cmd: '*'},
    map: {
      list: { GET : true, alias: 'user'}
    }
  }} )
}