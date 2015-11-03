app.factory( 'restFactory', ['$rootScope', '$http', function ( $rootScope, $http ) {

  var restFactory = {};

  restFactory.getServices = function ( service ) {
    return $http.get( service );
  };

  restFactory.getService = function ( service, id ) {
    return $http.get( service + (id ? '/' + id : "") );
  };

  restFactory.postService = function ( service, values ) {
    return $http.post( service, values );
  };

  restFactory.putService = function ( service, values ) {
    return $http.put( service, values );
  };

  restFactory.deleteService = function ( service, id ) {
    return $http.delete( service + '/' + id );
  };

  var rootScopeKeys = {}
  restFactory.set_data = function ( var_name, var_data ) {
    console.log( 'Set data[' + var_name + ']', var_data )
    $rootScope[var_name] = var_data;
    $rootScope.$broadcast( var_name )
    rootScopeKeys[var_name] = true
  };

  restFactory.clean_data = function () {
    for ( var key in rootScopeKeys ) {
      delete $rootScope[key]
    }
    rootScopeKeys = {}
  }

  restFactory.post = function ( service, values, successHandler, failedHandler ) {
    restFactory.postService( service, values )
      .success( function ( response ) {
        if ( response.err ) {
          if ( failedHandler ) {
            failedHandler( response )
          }
          else {
            // do something with error
            console.log( 'Error: ', response )
          }
        }
        else {
          if ( successHandler ) {
            successHandler( response )
          }
          else {
            // do something with error
          }
        }
      } )
      .error( function ( error ) {
        if ( failedHandler ) {
          failedHandler( {err: true, msg: error} )
        }
        else {
          // do something with error
          console.log( 'Error: ', error )
        }
      } );
  };

  restFactory.put = function ( service, values, successHandler, failedHandler ) {
    restFactory.putService( service, values )
      .success( function ( response ) {
        if ( response.err ) {
          if ( failedHandler ) {
            failedHandler( response )
          }
          else {
            console.log( 'Error: ', response )
          }
        }
        else {
          if ( successHandler ) {
            successHandler( response )
          }
          else {
          }
        }
      } )
      .error( function ( error ) {
        if ( failedHandler ) {
          failedHandler( {err: true, msg: error} )
        }
        else {
          // do something with error
          console.log( 'Error: ', error )
        }
      } );
  };

  restFactory.delete = function ( service, id, successHandler, failedHandler ) {
    restFactory.deleteService( service, id )
      .success( function ( response ) {
        if ( response.err ) {
          if ( failedHandler ) {
            failedHandler( response )
          }
          else {
            // do something with error
            console.log( 'Error: ', response.msg )
          }
        }
        else {
          if ( successHandler ) {
            successHandler( response )
          }
          else {
          }
        }
      } )
      .error( function ( error ) {
        if ( failedHandler ) {
          failedHandler( {err: true, msg: error} )
        }
        else {
          // do something with error
          console.log( 'Error: ', error )
        }
      } );
  };

  restFactory.getList = function ( service, successHandler, failedHandler ) {
    restFactory.getServices( service )
      .success( function ( response ) {
        if ( response.err ) {
          if ( failedHandler ) {
            failedHandler()
          }
          else {
            // do something with error
            console.log( 'Error: ', response.msg )
          }
        }
        else {
          successHandler( response )
        }
      } )
      .error( function ( error ) {
        if ( failedHandler ) {
          failedHandler()
        }
        else {
          // do something with error
          console.log( 'Error: ', error )
        }
      } );
  };

  restFactory.get = function ( service, id, successHandler, failedHandler ) {
    restFactory.getService( service, id )
      .success( function ( response ) {
        if ( response.err ) {
          if ( failedHandler ) {
            failedHandler()
          }
          else {
            // do something with error
            console.log( 'Error: ', response )
          }
        }
        else {
          successHandler( response )
        }
      } )
      .error( function ( error ) {
        if ( failedHandler ) {
          failedHandler()
        }
        else {
          // do something with error
          console.log( 'Error: ', error )
        }
      } );
  };

  return restFactory;
}] );
