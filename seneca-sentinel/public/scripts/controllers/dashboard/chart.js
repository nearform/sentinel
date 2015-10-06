'use strict';

angular.module( 'sbAdminApp' )
  .controller( 'ChartCtrl', ['$stateParams', '$rootScope', '$scope', 'restFactory', 'generalServices',
    function( $stateParams, $rootScope, $scope, restFactory, generalServices ) {

      generalServices.initPageData( $scope )

      $scope.mite_id = $stateParams.mite_id
      $scope.data_type = $stateParams.data_type

      $scope.loadData = function( successHandler ) {
        restFactory.getList( 'api/mite/' + $scope.mite_id + "/chart/" + $scope.data_type, function( response ) {
          $scope.chart_data = response.data
          if( successHandler ) {
            successHandler()
          }
        } )
      }


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
                id: "time",
                label: "Time",
                type: "string"
              },
              {
                id: "data",
                label: $scope.chart_data.data_label,
                type: "number"
              },
              {
                id: "total",
                label: $scope.chart_data.total_label,
                type: "number"
              }
            ],
            "rows": []
          }
          for( var i in $scope.chart_data.data ) {
            $scope.chartObject.data.rows.push(
              {
                c: [
                  {
                    v: $scope.chart_data.data[i].date
                  },
                  {
                    v: $scope.chart_data.data[i].value,
                    f: $scope.chart_data.data[i].value
                  },
                  {
                    v: $scope.chart_data.total,
                    f: $scope.chart_data.total
                  }
                ]
              }
            )
          }
          $scope.chartObject.options = {
            width: 1200,
            height: 700,
            "title": $scope.chart_data.data_label + " chart (today)",
            "colors": ['#0000FF', '#009900', '#990000'],
            "defaultColors": ['#0000FF', '#990000', '#990000'],
            "isStacked": "true",
            "fill": 20,
            "displayExactValues": true,
            "vAxis": {
              "title": $scope.chart_data.data_label,
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

      $scope.loadData( ChartInit )
    }
  ]
  );
