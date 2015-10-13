'use strict';

angular.module( 'sbAdminApp' )
  .controller( 'DocCtrl', ['$stateParams', '$rootScope', '$scope', 'restFactory', 'generalServices',
    function ( $stateParams, $rootScope, $scope, restFactory, generalServices ) {

      restFactory.set_data( "is_doc", true )

      $scope.mite_id = $stateParams.mite_id
      $scope.api_id = $stateParams.api_id

      $scope.loadApplication = function ( successHandler ) {
        restFactory.getList( 'pbl/mite/' + $scope.mite_id, function ( response ) {
          restFactory.set_data( "doc_app", response.data )
        } )
      }

      $scope.loadDoc = function ( successHandler ) {
        restFactory.getList( 'pbl/doc/' + $scope.mite_id, function ( response ) {
          restFactory.set_data( "doc", response.data )

          retrieveSelectedApi()
        } )

        function retrieveSelectedApi() {
          if ( !$scope.api_id ) {
            return
          }

          for (var i in $rootScope.doc.data){
            for (var j in $rootScope.doc.data[i]){
              if ($rootScope.doc.data[i][j].info && $rootScope.doc.data[i][j].info.id === $scope.api_id){
                restFactory.set_data( "selected_api", $rootScope.doc.data[i][j].info )
                return
              }
            }
          }
        }
      }

      $scope.loadApplication()
      $scope.loadDoc()
    }
  ]
  );
