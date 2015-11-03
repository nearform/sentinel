'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module( 'sbAdminApp' )
  .controller( 'MainCtrl', ['$rootScope', '$scope', 'restFactory', 'generalServices',
    function ( $rootScope, $scope, restFactory, generalServices ) {

      generalServices.initPageData( $scope )
      generalServices.loadApplications()
    }
  ] );
