'use strict';

angular.module( 'sbAdminApp' )
  .controller( 'SuiteCtrl', ['$stateParams', '$rootScope', '$scope', 'restFactory', 'generalServices',
    function ( $stateParams, $rootScope, $scope, restFactory, generalServices ) {

      generalServices.initPageData( $scope )

      $scope.viewMode = 'list'
      $scope.editSuite = {}
      $scope.mite = {}
      $scope.web_id = {}
      $scope.variable_property = ""
      $scope.variable_name = ""


      $scope.mite_id = $stateParams.mite_id

      $scope.loadApplication = function ( successHandler ) {
        restFactory.getList( 'api/mite/' + $scope.mite_id, function ( response ) {
          $scope.mite = response.data
          console.log( $scope.mite )
        } )
      }

      $scope.change2Create = function () {
        $scope.viewMode = 'edit'
      }

      $scope.showList = function () {
        $scope.viewMode = 'list'
        $scope.editSuite = {}
        $scope.web = {}
      }

      $scope.saveSuite = function ( done ) {
        if ( !$scope.mite.suites ) {
          $scope.mite.suites = []
        }

        if ( $scope.editSuite.id ) {
          // this is update
          for ( var i in $scope.mite.suites ) {
            if ( $scope.mite.suites[i].id === $scope.editSuite.id ) {
              generalServices.cleanObject( $scope.editSuite )
              $scope.mite.suites[i] = $scope.editSuite
            }
          }

          restFactory.put( 'api/mite', $scope.mite, function () {
            generalServices.loadApplications( function () {
//              $scope.showList()
              if ( done ) done()
            } )
          } )
        }
        else {
          $scope.editSuite.id = generalServices.uuid()

          generalServices.cleanObject( $scope.editSuite )
          $scope.mite.suites.push( $scope.editSuite )
          // this is create
          restFactory.post( 'api/mite', $scope.mite, function () {
            generalServices.loadApplications( function () {
//              $scope.showList()
              if ( done ) done()
            } )
          } )
        }
      }

      $scope.editSuiteFct = function ( suite_id ) {
        for ( var i in $scope.mite.suites ) {
          if ( $scope.mite.suites[i].id === suite_id ) {

            $scope.editSuite = angular.copy( $scope.mite.suites[i] )
            $scope.change2Create()
          }
        }
      }

      $scope.addUrl = function () {
        if ( !$scope.editSuite.urls ) {
          $scope.editSuite.urls = []
        }

        for ( var i in $scope.mite.web_api.data ) {
          if ( $scope.mite.web_api.data[i].id === $scope.web_id ) {
            $scope.editSuite.urls.push( angular.copy( $scope.mite.web_api.data[i] ) )
          }
        }
      }

      $scope.deleteUrl = function ( web_id ) {
        if ( !$scope.editSuite.urls ) {
          $scope.editSuite.urls = []
        }

        for ( var i in $scope.editSuite.urls ) {
          if ( $scope.editSuite.urls[i].id === web_id ) {
            $scope.editSuite.urls.splice( i, 1 )
            break
          }
        }
      }

      $scope.startMonitoring = function ( mite_id, suite_id ) {
        restFactory.post( 'api/mite/' + mite_id + '/suite/' + suite_id + '/monitor/start', {}, function () {
          $scope.loadApplication( function () {
          } )
        } )
      }

      $scope.runSuite = function ( mite_id, suite_id ) {
        restFactory.post( 'api/mite/' + mite_id + '/suite/' + suite_id + '/run/once', {}, function () {
          $scope.loadApplication( function () {
          } )
        } )
      }

      $scope.stopMonitoring = function ( mite_id, suite_id ) {
        restFactory.post( 'api/mite/' + mite_id + '/suite/' + suite_id + '/monitor/stop', {}, function () {
          $scope.loadApplication( function () {
          } )
        } )
      }

      $scope.loadApplication()

      $scope.moveUp = function ( web ) {
        for ( var i in $scope.editSuite.urls ) {
          if ( $scope.editSuite.urls[i].id === web.id ) {
            if ( i == 0 ) {
              break
            }

            var prev_index = parseInt( i ) - 1
            var prev = $scope.editSuite.urls[prev_index]
            $scope.editSuite.urls[prev_index] = $scope.editSuite.urls[i]
            $scope.editSuite.urls[i] = prev
            $scope.saveSuite( function () {
              $scope.editSuiteFct( $scope.editSuite.id )
            } )
            break
          }
        }
      }

      $scope.moveDown = function ( web ) {
        for ( var i in $scope.editSuite.urls ) {
          if ( $scope.editSuite.urls[i].id === web.id ) {
            if ( i == $scope.editSuite.urls.length - 1 ) {
              break
            }

            var next_index = parseInt( i ) + 1
            var next = $scope.editSuite.urls[next_index]
            $scope.editSuite.urls[next_index] = $scope.editSuite.urls[i]
            $scope.editSuite.urls[i] = next
            $scope.saveSuite( function () {
              $scope.editSuiteFct( $scope.editSuite.id )
            } )
            break
          }
        }
      }

      $scope.deleteVariable = function ( web_id, variable_id ) {
        for ( var i in $scope.editSuite.urls ) {
          if ( $scope.editSuite.urls[i].id === web_id ) {

            if ( !$scope.editSuite.urls[i].variables ) {
              $scope.editSuite.urls[i].variables = []
            }

            for ( var j in $scope.editSuite.urls[i].variables ) {
              var variable = $scope.editSuite.urls[i].variables[j]
              if ( variable.id === variable_id ) {
                $scope.editSuite.urls[i].variables.splice( j, 1 )
                break
              }
            }
            break
          }
        }
        $scope.saveSuite()
      }

      $scope.addVariable = function ( web_id ) {
        for ( var i in $scope.editSuite.urls ) {
          if ( $scope.editSuite.urls[i].id === web_id ) {

            if ( !$scope.editSuite.urls[i].variables ) {
              $scope.editSuite.urls[i].variables = []
            }

            $scope.editSuite.urls[i].variables.push( {
              id:       generalServices.uuid(),
              property: this.variable_property,
              name:     this.variable_name
            } )
            break
          }
        }
        $scope.saveSuite()
      }

      $scope.select_app_import = function () {
        for ( var i in $rootScope.mites ) {
          if ( $rootScope.mites[i].id === $scope.import_mite_id ) {
            $scope.import_suites = $rootScope.mites[i].suites
            return
          }
        }
      }

      $scope.deleteSuite = function ( suite_id ) {
        for ( var i in $scope.mite.suites ) {
          if ( $scope.mite.suites[i].id === suite_id ) {
            $scope.mite.suites.splice( i, 1 )
            $scope.saveMite()
            return
          }
        }
      }

      $scope.importSuite = function () {
        for ( var i in $rootScope.mites ) {
          if ( $rootScope.mites[i].id === $scope.import_mite_id ) {
            for ( var j in $rootScope.mites[i].suites ) {
              if ( $rootScope.mites[i].suites[j].id === $scope.import_suite_id ) {
                if ( !$scope.mite.suites ) {
                  $scope.mite.suites = []
                }
                var suite = angular.copy( $rootScope.mites[i].suites[j] )
                suite.id = generalServices.uuid()
                $scope.mite.suites.push( suite )
                $scope.saveMite()
                return
              }
            }
          }
        }
      }

      $scope.importAllSuites = function () {
        for ( var i in $rootScope.mites ) {
          if ( $rootScope.mites[i].id === $scope.import_mite_id ) {
            for ( var j in $rootScope.mites[i].suites ) {
              if ( !$scope.mite.suites ) {
                $scope.mite.suites = []
              }
              var suite = angular.copy( $rootScope.mites[i].suites[j] )
              suite.id = generalServices.uuid()
              $scope.mite.suites.push( suite )
            }
            $scope.saveMite()
            return
          }
        }
      }

      $scope.saveMite = function () {
        restFactory.put( 'api/mite', $scope.mite, function () {
          generalServices.loadApplications( function () {
          } )
        } )
      }
    }
  ]
  );
