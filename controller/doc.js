"use strict"

module.exports = function( options ) {
  var seneca = this;
  var name = 'DocCtrl'

  var entities = seneca.export( 'constants/entities' )

  function load( msg, response ) {
    var mite_id = msg.mite_id
    entities.getEntity( 'api_doc', seneca ).load$( {mite_id: mite_id}, function( err, doc ) {
      if( err ) {
        return response( null, {err: true, msg: err} )
      }

      doc = doc ? doc.data$( false ) : mite

      response( null, {err: false, data: doc} )
    } )
  }

  seneca
    .add( {role: name, cmd: 'load'}, load )


  seneca.act( {role: 'web', use: {
    name: name,
    prefix: '/pbl/',
    pin: {role: name, cmd: '*'},
    map: {
      load: { GET : true, alias: 'doc/:mite_id'}
    }
  }} )
}