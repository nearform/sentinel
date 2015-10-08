'use strict';

angular.module( 'sbAdminApp' )
  .controller( 'AlarmCtrl', ['$stateParams', '$rootScope', '$scope', 'restFactory', 'generalServices',
    function( $stateParams, $rootScope, $scope, restFactory, generalServices ) {

      generalServices.initPageData( $scope )

      $scope.mite_id = $stateParams.mite_id

      $scope.loadApplication = function() {
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

      $scope.addAlarm = function() {
        if( !$scope.mite.alarms ) {
          $scope.mite.alarms = []
        }

        for (var i in $scope.alarm_types){
          if ($scope.alarm_types[i].type_id === $scope.alarm_type_id){
            $scope.mite.alarms.push( {
              type_id: $scope.alarm_types[i].type_id,
              type_label: $scope.alarm_types[i].label,
              name: $scope.alarm_name,
              type: $scope.alarm_types[i].type,
              data_type: $scope.alarm_types[i].data_type,
              id: generalServices.uuid(),
              active: false
            } )
          }
        }
      }

      $scope.alarm_types = [
        {
          type_id: "1",
          type: 'bool',
          label: 'Connection lost (not implemented)'
        },
        {
          type_id: "2",
          type: 'bool',
          label: 'Test Suite Failed (not implemented)'
        },
        {
          type_id: "3",
          type: 'amount',
          data_type: 'memory_usage',
          label: 'OS memory usage level'
        },
        {
          type_id: "4",
          type: 'bool',
          data_type: 'application_restarted',
          label: 'Application restarted'
        },
        {
          type_id: "5",
          type: 'amount',
          data_type: 'load_5',
          label: 'Load Average 5 min'
        }
      ]
    }
  ]
  );
