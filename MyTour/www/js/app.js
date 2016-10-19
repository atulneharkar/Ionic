// Ionic Starter App

var db = null;

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var myApp = angular.module('starter', ['ionic', 'ngCordova']);

myApp.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    //db = $cordovaSQLite.openDB("Tmanager.db");
    db = window.openDatabase("Tmanager.db","1.0","Test","900000");
    // $cordovaSQLite.execute(db, "DROP TABLE Login");
    // $cordovaSQLite.execute(db, "DROP TABLE MyRequest");
    // $cordovaSQLite.execute(db, "DROP TABLE PendingApproval");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS Login (id integer primary key, username text, password text)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS MyRequest (id integer primary key, visit_purpose text, depart_from text, destination text, departure_date text, departure_time text, accomodation_required text, accomodation_from_date text, accomodation_to_date text, transportation_status text, approver text, mode text)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS PendingApproval (id integer primary key, username text, password text)");
  });
});

myApp.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $stateProvider

  .state('splash', {
    url: '/',
    templateUrl: 'templates/splash.html'
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/side-menu.html',
    controller: 'appCtrl'
  })

  .state('app.home', {
    url: '/home',
    views:{
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'homeCtrl'
      }
    }

  })

  .state('app.create-request', {
    url: '/create-request/:mode',
    views:{
      'menuContent': {
        templateUrl: 'templates/new_request.html',
        controller: 'newRequestCtrl'
      }
    }

  })

  .state('app.my-request', {
    url: '/my-request',
    views:{
      'menuContent': {
        templateUrl: 'templates/my_request.html',
        controller: 'myRequestsCtrl'
      }
    }

  })

  .state('app.request-detail', {
    url: '/request-detail/:requestId/:action',
    views:{
      'menuContent': {
        templateUrl: 'templates/request_detail.html',
        controller: 'requestDetailCtrl'
      }
    }

  })

  .state('app.pending-approvals', {
    url: '/pending-approvals',
    views:{
      'menuContent': {
        templateUrl: 'templates/pending_approvals.html',
        controller: 'pendingApprovalCtrl'
      }
    }

  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');

  $ionicConfigProvider.backButton.text('');

  $ionicConfigProvider.backButton.previousTitleText(false);
});
