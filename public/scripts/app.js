'use strict';
/**
 * @ngdoc overview
 * @name sbAdminApp
 * @description
 * # sbAdminApp
 *
 * Main module of the application.
 */
var app =
  angular
    .module( 'sbAdminApp', [
      'oc.lazyLoad',
      'ui.router',
      'ui.bootstrap',
      'angular-loading-bar',
      'googlechart'
    ] )
    .config( ['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', function( $stateProvider, $urlRouterProvider, $ocLazyLoadProvider ) {

      $ocLazyLoadProvider.config( {
        debug: false,
        events: true
      } );

      $urlRouterProvider.otherwise( '/dashboard/home' );

      $stateProvider
        .state( 'dashboard', {
          url: '/dashboard',
          templateUrl: 'views/dashboard/main.html',
          resolve: {
            loadMyDirectives: function( $ocLazyLoad ) {
              return $ocLazyLoad.load(
                {
                  name: 'sbAdminApp',
                  files: [
                    'scripts/directives/header/header.js',
                    'scripts/directives/header/header-notification/header-notification.js',
                    'scripts/directives/sidebar/sidebar.js',
                    'scripts/directives/sidebardoc/sidebardoc.js'
                  ]
                } ),
                $ocLazyLoad.load(
                  {
                    name: 'toggle-switch',
                    files: ["bower_components/angular-toggle-switch/angular-toggle-switch.min.js",
                      "bower_components/angular-toggle-switch/angular-toggle-switch.css"
                    ]
                  } ),
                $ocLazyLoad.load(
                  {
                    name: 'ngAnimate',
                    files: ['bower_components/angular-animate/angular-animate.js']
                  } )
              $ocLazyLoad.load(
                {
                  name: 'ngCookies',
                  files: ['bower_components/angular-cookies/angular-cookies.js']
                } )
              $ocLazyLoad.load(
                {
                  name: 'ngResource',
                  files: ['bower_components/angular-resource/angular-resource.js']
                } )
              $ocLazyLoad.load(
                {
                  name: 'ngSanitize',
                  files: ['bower_components/angular-sanitize/angular-sanitize.js']
                } )
              $ocLazyLoad.load(
                {
                  name: 'ngTouch',
                  files: ['bower_components/angular-touch/angular-touch.js']
                } )
            }
          }
        } )
        .state( 'dashboard.home', {
          url: '/home',
          controller: 'MainCtrl',
          templateUrl: 'views/dashboard/home.html',
          resolve: {
            loadMyFiles: function( $ocLazyLoad ) {
              return $ocLazyLoad.load( {
                name: 'sbAdminApp',
                files: [
                  'scripts/controllers/main.js'
                ]
              } )
            }
          }
        } )
        .state( 'dashboard.apps', {
          url: '/apps',
          controller: 'AppsCtrl',
          templateUrl: 'views/dashboard/apps.html',
          resolve: {
            loadMyFiles: function( $ocLazyLoad ) {
              return $ocLazyLoad.load( {
                name: 'sbAdminApp',
                files: [
                  'scripts/controllers/dashboard/apps.js'
                ]
              } )
            }
          }
        } )
        .state( 'dashboard.alarm', {
          url: '/alarm/:mite_id',
          controller: 'AlarmCtrl',
          templateUrl: 'views/dashboard/alarm.html',
          resolve: {
            loadMyFiles: function( $ocLazyLoad ) {
              return $ocLazyLoad.load( {
                name: 'sbAdminApp',
                files: [
                  'scripts/controllers/dashboard/alarm.js'
                ]
              } )
            }
          }
        } )
        .state( 'dashboard.status', {
          url: '/status/:mite_id',
          controller: 'StatsCtrl',
          templateUrl: 'views/dashboard/stats.html',
          resolve: {
            loadMyFiles: function( $ocLazyLoad ) {
              return $ocLazyLoad.load( {
                name: 'sbAdminApp',
                files: [
                  'scripts/controllers/dashboard/stats.js'
                ]
              } )
            }
          }
        } )
        .state( 'dashboard.suite_test', {
          url: '/suite_test/:mite_id/suite/:suite_id',
          controller: 'SuiteStatsCtrl',
          templateUrl: 'views/dashboard/suite_stats.html',
          resolve: {
            loadMyFiles: function( $ocLazyLoad ) {
              return $ocLazyLoad.load( {
                name: 'sbAdminApp',
                files: [
                  'scripts/controllers/dashboard/suite_stats.js'
                ]
              } )
            }
          }
        } )
        .state( 'dashboard.test_details', {
          url: '/suite/:suite_id/test/:test_id/details',
          controller: 'SuiteStatsCtrl',
          templateUrl: 'views/dashboard/suite_stats_details.html',
          resolve: {
            loadMyFiles: function( $ocLazyLoad ) {
              return $ocLazyLoad.load( {
                name: 'sbAdminApp',
                files: [
                  'scripts/controllers/dashboard/suite_stats.js'
                ]
              } )
            }
          }
        } )
        .state( 'dashboard.chart', {
          url: '/status/:mite_id/chart/:data_type',
          controller: 'ChartCtrl',
          templateUrl: 'views/dashboard/chart.html',
          resolve: {
            loadMyFiles: function( $ocLazyLoad ) {
              return $ocLazyLoad.load( {
                name: 'sbAdminApp',
                files: [
                  'scripts/controllers/dashboard/chart.js'
                ]
              } )
            }
          }
        } )
        .state( 'dashboard.client', {
          url: '/client',
          controller: 'ClientCtrl',
          templateUrl: 'views/dashboard/client.html',
          resolve: {
            loadMyFiles: function( $ocLazyLoad ) {
              return $ocLazyLoad.load( {
                name: 'sbAdminApp',
                files: [
                  'scripts/controllers/dashboard/client.js'
                ]
              } )
            }
          }
        } )
        .state( 'dashboard.suite', {
          url: '/suite/:mite_id',
          controller: 'SuiteCtrl',
          templateUrl: 'views/dashboard/suite.html',
          resolve: {
            loadMyFiles: function( $ocLazyLoad ) {
              return $ocLazyLoad.load( {
                name: 'sbAdminApp',
                files: [
                  'scripts/controllers/dashboard/suite.js'
                ]
              } )
            }
          }
        } )
        .state( 'dashboard.doc', {
          url: '/doc/:mite_id',
          controller: 'DocCtrl',
          templateUrl: 'views/dashboard/doc.html',
          resolve: {
            loadMyFiles: function( $ocLazyLoad ) {
              return $ocLazyLoad.load( {
                name: 'sbAdminApp',
                files: [
                  'scripts/controllers/dashboard/doc.js'
                ]
              } )
            }
          }
        } )
        .state( 'dashboard.doc_api', {
          url: '/doc/:mite_id/api/:api_id',
          controller: 'DocCtrl',
          templateUrl: 'views/dashboard/doc.html',
          resolve: {
            loadMyFiles: function( $ocLazyLoad ) {
              return $ocLazyLoad.load( {
                name: 'sbAdminApp',
                files: [
                  'scripts/controllers/dashboard/doc.js'
                ]
              } )
            }
          }
        } )
        .state( 'register', {
          templateUrl: 'views/pages/register.html',
          url: '/register',
          controller: 'LoginCtrl',
          resolve: {
            loadMyFiles: function( $ocLazyLoad ) {
              return $ocLazyLoad.load( {
                name: 'sbAdminApp',
                files: [
                  'scripts/controllers/login.js'
                ]
              } )
            }
          }
        } )
        .state( 'login', {
          templateUrl: 'views/pages/login.html',
          url: '/login',
          controller: 'LoginCtrl',
          resolve: {
            loadMyFiles: function( $ocLazyLoad ) {
              return $ocLazyLoad.load( {
                name: 'sbAdminApp',
                files: [
                  'scripts/controllers/login.js'
                ]
              } )
            }
          }
        } )
    }] );

    
