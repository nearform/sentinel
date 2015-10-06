'use strict';

angular.module( 'sbAdminApp' )
  .controller( 'StatsCtrl', ['$stateParams', '$rootScope', '$scope', 'restFactory', 'generalServices',
    function( $stateParams, $rootScope, $scope, restFactory, generalServices ) {

      generalServices.initPageData( $scope )

      $scope.mite_id = $stateParams.mite_id

      $scope.loadApplication = function( successHandler ) {
        restFactory.getList( 'api/mite/' + $scope.mite_id, function( response ) {
          $scope.mite = response.data
        } )
      }

      $scope.loadOSStatus = function( successHandler ) {
        restFactory.getList( 'api/mite/' + $scope.mite_id + "/os_status", function( response ) {
          $scope.os_status = response.data
        } )
      }

      $scope.loadSenecaStatus = function( successHandler ) {
        restFactory.getList( 'api/mite/' + $scope.mite_id + "/seneca_status", function( response ) {
          $scope.seneca_status = response.data
        } )
      }

      $scope.loadApplication()
      $scope.loadOSStatus()
      $scope.loadSenecaStatus()

      $scope.dataWithGraphs = ['load_1', 'load_5', 'load_15', 'used_memory']
    }
  ]
  );
