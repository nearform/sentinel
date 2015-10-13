'use strict';

angular.module( 'sbAdminApp' )
  .controller( 'DocCtrl', ['$stateParams', '$rootScope', '$scope', 'restFactory', 'generalServices',
    function ( $stateParams, $rootScope, $scope, restFactory, generalServices ) {

      $scope.mite = {}
      restFactory.set_data( "is_doc", true)

      $scope.mite_id = $stateParams.mite_id

      $scope.loadApplication = function ( successHandler ) {
        restFactory.getList( 'pbl/mite/' + $scope.mite_id, function ( response ) {
          $scope.mite = response.data
          restFactory.set_data( "doc_app", response.data)

          console.log( $scope.mite )
        } )
      }

      $scope.loadApplication()
    }
  ]
  );
