app.factory( 'generalServices', ['$state', '$rootScope', '$http', 'restFactory', function ( $state, $rootScope, $http, restFactory ) {
  var functions = {}

  functions.getAuthStatus = function ( successHandler, faultHandler ) {
    restFactory.getServices( 'auth/user' )
      .success( function ( data ) {
        if ( !data.user ) {
          return processFaultHandler( faultHandler )
        }
        restFactory.set_data( 'user', data.user )
        if ( successHandler ) {
          successHandler()
        }
      } )
      .error( function ( error ) {
        return processFaultHandler( faultHandler, error )
      } );
  }

  function processFaultHandler( faultHandler, error ) {
    delete $rootScope.user
    $state.go( "login" );
    if ( faultHandler ) {
      return faultHandler( error )
    }
  }

  functions.logout = function () {
    restFactory.getServices( "auth/logout" )
      .success( function ( data ) {
        console.log( "logout user success" );
        $rootScope.loggedIn = false;
        restFactory.clean_data()
        $state.go( "app" );
      } )
      .error( function ( error ) {
        console.log( "logout user error!" );
      } );
  };

  functions.uuid = function () {
    return "" + (new Date()).getTime()
  }

  functions.cleanObject = function ( obj ) {
    var key = '$$hashKey'
    if ( angular.isArray( obj ) || angular.isObject( obj ) ) {
      delete obj[key]
      for ( var i in obj ) {
        if ( angular.isArray( obj[i] ) || angular.isObject( obj[i] ) ) {
          functions.cleanObject( obj[i] )
        }
      }
    }
    else {
      return
    }
  }

  functions.loadApplications = function ( successHandler ) {
    restFactory.getList( 'api/mite', function ( response ) {
      restFactory.set_data('mites', response.data)

      if ( successHandler ) successHandler( response )
    } )
  }


  functions.loadNotifications = function () {
    restFactory.getList( "api/notification", function ( response ) {
      restFactory.set_data( "notificationNumber", response.data.newNotificationsNumber )
      restFactory.set_data( "notifications", response.data )
      setTimeout( functions.loadNotifications, 2 * 60 * 1000 )
    } )
  }

  functions.initPageData = function ( scope, successHandler, errorHandler ) {
    functions.getAuthStatus( function () {
      functions.loadNotifications()
      functions.loadApplications()

      scope.general = functions
      if ( successHandler ) {
        successHandler()
      }
    }, errorHandler )
  }

  return functions
}] );
