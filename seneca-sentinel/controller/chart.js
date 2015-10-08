"use strict"

module.exports = function( options ) {
  var seneca = this;
  var name = 'ChartCtrl'

  var entities = seneca.export( 'constants/entities' )

  function loadChartData( msg, response ) {
    var data_type = msg.data_type

    executor[data_type]( msg, response )
  }

  var executor = {
    load_1: function( args, response ) {
      entities.getEntity( 'os_status', seneca ).load$( {sort$: {date: -1}}, function( err, db ) {
        if( err || !db || db.length === 0) {
          args.total_value = 0
          args.total_label = '# CPU'
        }
        else {
          for( var i in db.data ) {
            if( db.data[i].data_type === 'cpus' ) {
              args.total_value = db.data[i].value
              args.total_label = db.data[i].name
              break
            }
          }
        }
        load_data( args, response )
      } )
    },
    load_5: function( args, response ) {
      entities.getEntity( 'os_status', seneca ).load$( {sort$: {date: -1}}, function( err, db ) {
        if( err || !db || db.length === 0) {
          args.total_value = 0
          args.total_label = '# CPU'
        }
        else {
          for( var i in db.data ) {
            if( db.data[i].data_type === 'cpus' ) {
              args.total_value = db.data[i].value
              args.total_label = db.data[i].name
              break
            }
          }
        }
        load_data( args, response )
      } )
    },
    load_15: function( args, response ) {
      entities.getEntity( 'os_status', seneca ).load$( {sort$: {date: -1}}, function( err, db ) {
        if( err || !db || db.length === 0) {
          args.total_value = 0
          args.total_label = '# CPU'
        }
        else {
          for( var i in db.data ) {
            if( db.data[i].data_type === 'cpus' ) {
              args.total_value = db.data[i].value
              args.total_label = db.data[i].name
              break
            }
          }
        }
        load_data( args, response )
      } )
    },
    used_memory: function( args, response ) {
      entities.getEntity( 'os_status', seneca ).load$( {sort$: {date: -1}}, function( err, db ) {
        if( err || !db || db.length === 0) {
          args.total_value = 0
          args.total_label = 'Total Memory'
        }
        else {
          for( var i in db.data ) {
            if( db.data[i].data_type === 'total_memory' ) {
              args.total_value = db.data[i].value
              args.total_label = db.data[i].name
              break
            }
          }
        }
        load_data( args, response )
      } )
    }
  }


  function load_data( args, response ) {
    var data = {}
    data.total_label = args.total_label
    data.total = args.total_value
    data.data = []

//    var today = new Date(Date.now() - 24 * 60 * 60 * 1000)

    var q = {
      mite_id: args.mite_id,
      data_type: args.data_type,
//      date: {"$lt": today},
      sort$: {date: -1},
      fields$: {name: true, value: true, date: true},
      limit$: 500
    }
    console.log(q)
    entities.getEntity( 'os_status_instant', seneca ).list$(
      q, function( err, db_data ) {
      if( err ) {
        return response( null, {err: true, msg: err} )
      }
      if( !db_data ) {
        db_data = []
      }

      for( var i = db_data.length - 1; i--; i > 0 ) {
        var myDate = new Date( db_data[i].date )
        data.data_label = db_data[i].name
        data.data.push( {
          value: db_data[i].value,
          date: (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear() + " " +
            myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds()
        } )
      }


      response( null, {err: false, data: data} )
    } )
  }

  seneca
    .add( {role: name, cmd: 'loadChartData'}, loadChartData )

  seneca.act( {role: 'web', use: {
    name: name,
    prefix: '/api/',
    pin: {role: name, cmd: '*'},
    map: {
      loadChartData: { GET: true, alias: 'mite/:mite_id/chart/:data_type'}
    }
  }} )
}