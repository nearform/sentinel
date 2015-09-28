'use strict';

angular.module( 'sbAdminApp' )
  .controller( 'SuiteStatsCtrl', ['$stateParams', '$rootScope', '$scope', 'restFactory', 'generalServices',
    function ( $stateParams, $rootScope, $scope, restFactory, generalServices ) {
      console.log( 'SuiteStatsCtrl' )
      generalServices.initPageData( $scope )

      $scope.mite_id = $stateParams.mite_id
      $scope.suite_id = $stateParams.suite_id

      $scope.loadApplication = function ( successHandler ) {
        restFactory.getList( 'api/mite/' + $scope.mite_id, function ( response ) {
          $scope.mite = response.data
        } )
      }

      $scope.loadSuiteTests = function ( successHandler ) {
        restFactory.getList( 'api/suite/' + $scope.suite_id + '/tests', function ( response ) {
          $scope.tests = response.data
        } )
      }

      $scope.loadApplication()
      $scope.loadSuiteTests()
    }
  ]
  );
