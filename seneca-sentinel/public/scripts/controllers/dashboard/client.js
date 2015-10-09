'use strict';

angular.module( 'sbAdminApp' )
  .controller( 'ClientCtrl', ['$stateParams', '$rootScope', '$scope', 'restFactory', 'generalServices',
    function( $stateParams, $rootScope, $scope, restFactory, generalServices ) {

      generalServices.initPageData( $scope )

      $scope.viewMode = 'list'
      $scope.client = {}

      $scope.loadClients = function( successHandler ) {
        restFactory.getList( 'api/client', function( response ) {
          $scope.clients = response.data
          if (successHandler){
            successHandler()
          }
        } )
      }

      $scope.loadUsers = function( successHandler ) {
        restFactory.getList( 'api/user', function( response ) {
          $scope.users = response.data
          if (successHandler){
            successHandler()
          }
        } )
      }

      $scope.loadClients()
      $scope.loadUsers()

      $scope.change2Create = function () {
        $scope.manage_user = {}
        $scope.viewMode = 'edit'
      }

      $scope.showList = function () {
        $scope.manage_user = {}
        $scope.viewMode = 'list'
      }

      $scope.saveClient = function () {
        if ( $scope.client.id ) {
          // this is update
          restFactory.put( 'api/client', $scope.client, function (response) {
            $scope.loadClients( function () {
              if (!response.err){
                $scope.client = response.data
              }
            } )
          } )
        }
        else {
          // this is create
          restFactory.post( 'api/client', $scope.client, function () {
            $scope.loadClients( function () {
              if (!response.err){
                $scope.client = response.data
              }
            } )
          } )
        }
      }

      $scope.editClient = function ( client ) {
        $scope.client = angular.copy( client )
        $scope.viewMode = 'edit'
      }

      $scope.addUser = function (user_id){
        if (!$scope.client.users){
          $scope.client.users = []
        }

        for (var i in $scope.client.users){
          if ($scope.client.users[i].id === user_id){
            return
          }
        }

        for (var i in $scope.users){
          if ($scope.users[i].id === user_id)

          $scope.client.users.push( $scope.users[i] )
          $scope.saveClient()
        }
      }


      $scope.removeUser = function (user_id){
        if (!$scope.client.users){
          $scope.client.users = []
        }

        for (var i in $scope.client.users){
          if ($scope.client.users[i].id === user_id){
            $scope.client.users.splice(i, 1)
            $scope.saveClient()
          }
        }
      }


      $scope.selectUser = function (manage_user_id){
        for (var i in $scope.users){
          if ($scope.users[i].id === manage_user_id){
            $scope.manage_user = angular.copy($scope.users[i])
          }
        }
      }


      $scope.saveUser = function (manage_user){
        restFactory.post( 'auth/update_user', $scope.manage_user, function () {
          $scope.loadUsers( function () {
            if (!response.err){
              $scope.users = response.data
              $scope.manage_user = {}
            }
          } )
        } )
      }


      $scope.registerUser = function (manage_user){
      }
    }
  ]
  );
