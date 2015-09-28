'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module( 'sbAdminApp' )
  .controller( 'LoginCtrl', ['$state', '$rootScope', '$scope', 'restFactory',
    function ( $state, $rootScope, $scope, restFactory ) {

      $scope.loginData = {}
      $scope.login = function () {
        restFactory.postService( "auth/login", $scope.loginData )
          .success( function ( data ) {
            if ( data.ok ) {
              $rootScope.loggedIn = true;
              restFactory.set_data('user', data.user)
              $state.go( "dashboard.home" );
            }
            else {
            }
          } )
          .error( function ( error ) {
            console.log( error );
            console.log( "login error!" );
          } );
      };
    }] );
