'use strict';

angular.module('sbAdminApp')
  .directive('sidebar_doc',['$location',function() {
    return {
      templateUrl:'scripts/directives/sidebar_doc/sidebar_doc.html',
      restrict: 'E',
      replace: true,
      scope: {
      },
      controller:function($scope, $rootScope){
        $scope.selectedMenu = 'dashboard';
        $scope.collapseVar = 0;
        $scope.multiCollapseVar = 0;
        
        $scope.check = function(x){
          
          if(x==$scope.collapseVar)
            $scope.collapseVar = 0;
          else
            $scope.collapseVar = x;
        };
        
        $scope.multiCheck = function(y){
          
          if(y==$scope.multiCollapseVar)
            $scope.multiCollapseVar = 0;
          else
            $scope.multiCollapseVar = y;
        };
      }
    }
  }]);
