'use strict';

angular.module( 'sbAdminApp' )
  .controller( 'AlarmCtrl', ['$stateParams', '$rootScope', '$scope', 'restFactory', 'generalServices',
    function( $stateParams, $rootScope, $scope, restFactory, generalServices ) {

      generalServices.initPageData( $scope )

      $scope.mite_id = $stateParams.mite_id

      $scope.loadApplication = function(  ) {
        restFactory.getList( 'api/mite/' + $scope.mite_id, function( response ) {
          $scope.mite = response.data
          console.log( $scope.mite )
        } )
      }

      $scope.loadApplication()

      $scope.saveMite = function() {
        restFactory.put( 'api/mite', $scope.mite, function() {
          $scope.loadApplication()
        } )
      }

      $scope.addAlarm = function () {
        if ( !$scope.mite.alarms ) {
          $scope.mite.alarms = []
        }

        $scope.mite.alarms.push( {
          type: $scope.alarm_type,
          name: $scope.name,
          id: generalServices.uuid(),
          active: false
        } )
      }

    }
  ]
  );
