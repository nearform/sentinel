'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module( 'sbAdminApp' )
  .controller( 'AppsCtrl', ['$rootScope', '$scope', 'restFactory', 'generalServices',
    function ( $rootScope, $scope, restFactory, generalServices ) {

      generalServices.initPageData( $scope )

      $scope.viewMode = 'list'
      $scope.mite = {}
      $scope.displayMiteStatus

      $scope.loadClients = function( successHandler ) {
        restFactory.getList( 'api/client', function( response ) {
          $scope.clients = response.data
          if (successHandler){
            successHandler()
          }
        } )
      }

      $scope.displayStatus = function ( mite ) {
        if ( $scope.displayMiteStatus === mite ) {
          delete $scope.displayMiteStatus
        }
        else {
          $scope.displayMiteStatus = mite
        }
      }

      $scope.saveMite = function () {
        if ( !$scope.mite.monitor ) {
          $scope.mite.monitor = {}
        }
        if ( !$scope.mite.configuration ) {
          $scope.mite.configuration = {}
        }

        if ( $scope.mite.id ) {
          // this is update
          restFactory.put( 'api/mite', $scope.mite, function () {
            generalServices.loadApplications( function () {
              $scope.viewMode = 'list'
              $scope.mite = {}
            } )
          } )
        }
        else {
          // this is create
          restFactory.post( 'api/mite', $scope.mite, function () {
            generalServices.loadApplications( function () {
              $scope.viewMode = 'list'
              $scope.mite = {}
            } )
          } )
        }
      }

      $scope.editMite = function ( mite ) {
        $scope.mite = angular.copy( mite )
        $scope.viewMode = 'edit'
      }

      $scope.change2Create = function () {
        $scope.viewMode = 'edit'
      }

      $scope.showList = function () {
        $scope.viewMode = 'list'
      }

      $scope.connect = function ( mite ) {
        restFactory.post( 'api/mite/' + mite.id + '/forceConnect', {}, function () {
          generalServices.loadApplications( function () {
          } )
        } )
      }

      $scope.startMonitoring = function ( mite ) {
        restFactory.post( 'api/mite/' + mite.id + '/monitor/start', {}, function () {
          generalServices.loadApplications( function () {
          } )
        } )
      }

      $scope.stopMonitoring = function ( mite ) {
        restFactory.post( 'api/mite/' + mite.id + '/monitor/stop', {}, function () {
          generalServices.loadApplications( function () {
          } )
        } )
      }

      $scope.loadClients()
    }
  ]
  );
