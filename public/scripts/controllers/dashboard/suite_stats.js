'use strict';

angular.module( 'sbAdminApp' )
  .controller( 'SuiteStatsCtrl', ['$stateParams', '$rootScope', '$scope', 'restFactory', 'generalServices',
    function ( $stateParams, $rootScope, $scope, restFactory, generalServices ) {
      console.log( 'SuiteStatsCtrl' )
      generalServices.initPageData( $scope )

      $scope.mite_id = $stateParams.mite_id
      $scope.suite_id = $stateParams.suite_id
      $scope.test_id = $stateParams.test_id


      $scope.loadApplication = function ( successHandler ) {
        restFactory.getList( 'api/mite/' + $scope.mite_id, function ( response ) {
          $scope.mite = response.data
        } )
      }


      $scope.loadSuiteTests = function ( successHandler ) {
        restFactory.getList( 'api/suite/' + $scope.suite_id + '/tests', function ( response ) {
          $scope.tests = response.data
          if (successHandler){
            successHandler()
          }
        } )
      }


      $scope.loadApplication()
      $scope.loadSuiteTests(function(){
        if ($scope.test_id){
          for (var i in $scope.tests){
            if ($scope.tests[i].id === $scope.test_id){
              $scope.test_details = $scope.tests[i]
            }
          }
        }
      })


      $scope.runSuite = function (  ) {
        restFactory.post( 'api/mite/' + $scope.mite_id + '/suite/' + $scope.suite_id + '/run/once', {}, function () {
          $scope.loadApplication( function () {
          } )
        } )
      }


      $scope.replayRequest = function (  ) {
        var body = {
          url: this.replay_url,
          test_id:$scope.test_id
        }
        restFactory.post( 'api/suite/' + $scope.suite_id + '/replayTest', body, function () {
          $scope.loadApplication( function (response) {
            $scope.replay_request = response.data
          } )
        } )
      }
    }
  ]
  );
