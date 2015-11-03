'use strict';

angular.module( 'sbAdminApp' )
  .directive( 'sidebardoc', ['$location', function() {
    return {
      templateUrl: 'scripts/directives/sidebardoc/sidebardoc.html',
      restrict: 'E',
      replace: true,
      scope: {
        docapp: "=",
        doc: "="
      },
      controller: function( $scope ) {
        $scope.selectedMenu = 'dashboard';
        $scope.collapseVar = 0;
        $scope.multiCollapseVar = 0;

        $scope.check = function( x ) {

          if( x == $scope.collapseVar ) {
            $scope.collapseVar = 0;
          }
          else {
            $scope.collapseVar = x;
          }
        };

        $scope.multiCheck = function( y ) {

          if( y == $scope.multiCollapseVar ) {
            $scope.multiCollapseVar = 0;
          }
          else {
            $scope.multiCollapseVar = y;
          }
        };
      }
    }
  }] );
