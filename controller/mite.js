"use strict"

module.exports = function( options ) {
  var seneca = this;
  var name = 'MiteCtrl'

  var entities = seneca.export( 'constants/entities' )


  function createMite( msg, response ) {
    var user = msg.req$.user.user

    msg.users = msg.users || []

    // retrieve client users and copy to application
    entities.getEntity("client", seneca ).load$({id: msg.client_id}, function(err, client){
      if( err ) {
        return response( null, {err: true, msg: err} )
      }

      if( !client ) {
        return response( null, {err: true, msg: 'Invalid client'} )
      }

      msg.users = client.users || []
      msg.client_name = client.name

      entities.getEntity( 'mite', seneca, msg ).save$( function( err, mite ) {
        if( err ) {
          return response( null, {err: true, msg: err} )
        }

        response( null, {err: false, data: mite.data$( false )} )
      } )
    })
  }


  function list( msg, response ) {
    var user = msg.req$.user.user

    var q = {}
    q.users = {$elemMatch: {id:user.id}}
    q.sort$ = {client_id: -1}

    entities.getEntity( 'mite', seneca ).list$(
      q
//      {
//        fields$:
//        {
//          name: true,
//          protocol: true,
//          host: true,
//          port: true,
//          last_connect_time: true,
//          monitoring: true,
//          protocol_version: true,
//          status: true,
//          suites_validated: true
//        }
//      }
  , function( err, mites ) {

      if( err ) {
        return response( null, {err: true, msg: err} )
      }

      if( !mites ) {
        mites = []
      }

      for( var i in mites ) {
        mites[i] = mites[i].data$( false )
      }

      response( null, {err: false, data: mites, count: mites.length} )
    } )
  }


  function load( msg, response ) {
    var mite_id = msg.mite_id
    entities.getEntity( 'mite', seneca ).load$( {id: mite_id}, function( err, mite ) {
      if( err ) {
        return response( null, {err: true, msg: err} )
      }

      mite = mite ? mite.data$( false ) : mite

      response( null, {err: false, data: mite} )
    } )
  }


  function os_status( msg, response ) {
    var mite_id = msg.mite_id
    entities.getEntity( 'os_status', seneca ).load$( {mite_id: mite_id, sort$: {date: -1}}, function( err, status ) {
      if( err ) {
        return response( null, {err: true, msg: err} )
      }

      status = status ? status.data$( false ) : status

      response( null, {err: false, data: status} )
    } )
  }


  function seneca_status( msg, response ) {
    var mite_id = msg.mite_id
    entities.getEntity( 'seneca_status', seneca ).load$( {mite_id: mite_id, sort$: {date: -1}}, function( err, status ) {
      if( err ) {
        return response( null, {err: true, msg: err} )
      }

      status = status ? status.data$( false ): status

      response( null, {err: false, data: status} )
    } )
  }


  function forceConnect( msg, response ) {
    var that = this
    var mite_id = msg.mite_id

    that.act( "role:'mite',cmd:'connect'", {id: mite_id}, function( err ) {
      if( err ) {
        return response( null, {err: true, msg: 'Connect error'} )
      }

      response( null, {err: false} )
    } )
  }


  function startMonitoring( msg, response ) {
    var that = this
    var mite_id = msg.mite_id

    that.act( "role:'monitoring',cmd:'start'", {id: mite_id}, function( err, mite ) {
      if( err ) {
        return response( null, {err: true, msg: err} )
      }

      response( null, {err: false, data: mite} )
    } )
  }


  function stopMonitoring( msg, response ) {
    var that = this
    var mite_id = msg.mite_id

    that.act( "role:'monitoring',cmd:'stop'", {id: mite_id}, function( err, mite ) {
      if( err ) {
        return response( null, {err: true, msg: err} )
      }

      response( null, {err: false, data: mite} )
    } )
  }

  function deleteMite( msg, response ) {
    var mite_id = msg.id
    if (!mite_id){
      return response(null, {err: true, msg: 'No valid application.'})
    }

    entities.getEntity('mite', seneca ).delete$({id: mite_id}, function(err){
      if (err){
        return response(null, {err: true, msg: 'Some error occured'})
      }

      // this should be changed
      // now ignore errors, try to delete as much as possible
      entities.getEntity('api_doc', seneca ).delete$({mite_id: mite_id, all$: true}, function(){
        entities.getEntity('notification', seneca ).delete$({"mite.id": mite_id, all$: true}, function(){
          entities.getEntity('os_status', seneca ).delete$({mite_id: mite_id, all$: true}, function(){
            entities.getEntity('os_status_instant', seneca ).delete$({mite_id: mite_id, all$: true}, function(){
              entities.getEntity('seneca_status', seneca ).delete$({mite_id: mite_id, all$: true}, function(){
                entities.getEntity('suite_test', seneca ).delete$({mite_id: mite_id, all$: true}, function(){
                  response(null, {err: false})
                })
              })
            })
          })
        })
      })
    })
  }


  seneca
    .add( {role: name, cmd: 'deleteMite'}, deleteMite )
    .add( {role: name, cmd: 'createMite'}, createMite )
    .add( {role: name, cmd: 'updateMite'}, createMite )
    .add( {role: name, cmd: 'forceConnect'}, forceConnect )
    .add( {role: name, cmd: 'startMonitoring'}, startMonitoring )
    .add( {role: name, cmd: 'stopMonitoring'}, stopMonitoring )
    .add( {role: name, cmd: 'list'}, list )
    .add( {role: name, cmd: 'load'}, load )
    .add( {role: name, cmd: 'load_public'}, load )
    .add( {role: name, cmd: 'os_status'}, os_status )
    .add( {role: name, cmd: 'seneca_status'}, seneca_status )


  seneca.act( {role: 'web', use: {
    name: name,
    prefix: '/api/',
    pin: {role: name, cmd: '*'},
    map: {
      deleteMite:       { DELETE: true,alias: 'mite/:id'},
      createMite:       { POST: true, alias: 'mite'},
      updateMite:       { PUT : true, alias: 'mite'},
      forceConnect:     { POST: true, alias: 'mite/:mite_id/forceConnect'},
      startMonitoring:  { POST: true, alias: 'mite/:mite_id/monitor/start'},
      stopMonitoring:   { POST: true, alias: 'mite/:mite_id/monitor/stop'},
      list:             { GET : true, alias: 'mite'},
      load:             { GET : true, alias: 'mite/:mite_id'},
      os_status:        { GET : true, alias: 'mite/:mite_id/os_status'},
      seneca_status:    { GET : true, alias: 'mite/:mite_id/seneca_status'}
    }
  }} )

  seneca.act( {role: 'web', use: {
    name: name,
    prefix: '/pbl/',
    pin: {role: name, cmd: '*'},
    map: {
      load_public: { GET : true, alias: 'mite/:mite_id'}
    }
  }} )
}