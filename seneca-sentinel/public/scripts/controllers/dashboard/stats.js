'use strict';

angular.module( 'sbAdminApp' )
  .controller( 'StatsCtrl', ['$stateParams', '$rootScope', '$scope', 'restFactory', 'generalServices',
    function( $stateParams, $rootScope, $scope, restFactory, generalServices ) {

      generalServices.initPageData( $scope )

      $scope.mite_id = $stateParams.mite_id

      $scope.loadApplication = function( successHandler ) {
        restFactory.getList( 'api/mite/' + $scope.mite_id, function( response ) {
          $scope.mite = response.data
        } )
      }

      $scope.loadOSStatus = function( successHandler ) {
        restFactory.getList( 'api/mite/' + $scope.mite_id + "/os_status", function( response ) {
          $scope.os_status = response.data
        } )
      }

      $scope.loadSenecaStatus = function( successHandler ) {
        restFactory.getList( 'api/mite/' + $scope.mite_id + "/seneca_status", function( response ) {
          $scope.seneca_status = response.data
        } )
      }

      $scope.loadApplication()
      $scope.loadOSStatus()
      $scope.loadSenecaStatus()

      $scope.dataWithGraphs = ['load_1', 'load_5', 'load_15', 'used_memory']

      function ChartInit() {
        // Properties
        $scope.chartObject = {};

        //Methods
        $scope.hideSeries = hideSeries;

        init();

        function hideSeries( selectedItem ) {
          var col = selectedItem.column;
          if( selectedItem.row === null ) {
            if( $scope.chartObject.view.columns[col] == col ) {
              $scope.chartObject.view.columns[col] = {
                label: $scope.chartObject.data.cols[col].label,
                type: $scope.chartObject.data.cols[col].type,
                calc: function() {
                  return null;
                }
              };
              $scope.chartObject.options.colors[col - 1] = '#CCCCCC';
            }
            else {
              $scope.chartObject.view.columns[col] = col;
              $scope.chartObject.options.colors[col - 1] = $scope.chartObject.options.defaultColors[col - 1];
            }
          }
        }

        function init() {
          $scope.chartObject.type = "LineChart";
          $scope.chartObject.displayed = false;
          $scope.chartObject.data = {
            "cols": [
              {
                id: "month",
                label: "Time",
                type: "string"
              },
              {
                id: "mem_usage",
                label: "Memory usage",
                type: "number"
              },
              {
                id: "mem-total",
                label: "Total memory",
                type: "number"
              }
            ],
            "rows": [
              {
                c: [
                  {
                    v: 'January'
                  },
                  {
                    v: 8,
                    f: "42 items"
                  },
                  {
                    v: 16,
                    f: "16"
                  }
                ]
              },
              {
                c: [
                  {
                    v: "February"
                  },
                  {
                    v: 13
                  },
                  {
                    v: 16,
                    f: "16"
                  }
                ]

              },
              {
                c: [
                  {
                    v: "March"
                  },
                  {
                    v: 12
                  },
                  {
                    v: 16,
                    f: "16"
                  }

                ]
              }
            ]
          };
          $scope.chartObject.options = {
            width: 900,
            height: 500,
            "title": "OS status",
            "colors": ['#0000FF', '#009900', '#990000'],
            "defaultColors": ['#0000FF', '#990000', '#990000'],
            "isStacked": "true",
            "fill": 20,
            "displayExactValues": true,
            "vAxis": {
              "title": "Memory",
              "gridlines": {
                "count": 10
              }
            },
            "hAxis": {
              "title": "Date"
            }
          };

          $scope.chartObject.view = {
            columns: [0, 1, 2]
          };
        }
      }

      ChartInit()

    }
  ]
  );
