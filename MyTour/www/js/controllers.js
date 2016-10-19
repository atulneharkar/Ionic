var myApp = angular.module('starter');

myApp.controller('splashCtrl', ['$window', '$state', function($window, $state, $cordovaSQLite) {
  var height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);
  var calculatedHeight = (height);
  $('.splash-wrapper .main-wrapper').css('height', calculatedHeight);

  $window.setTimeout(function () {
    $state.go('login');
  }, 3000);

}]);

myApp.controller('loginCtrl', ['$window', '$scope', '$state', '$location', '$http', '$cordovaSQLite', function($window, $scope, $state, $location, $http, $cordovaSQLite) {

  var height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);
  var calculatedHeight = (height);
  $('.login-wrapper .main-wrapper').css('height', calculatedHeight - 5);

  $scope.loginSubmit = function(isValid) {
        $scope.submitted = true;

        if(isValid) {
          $scope.loading = true;

          //needs to be removed while generating apk
          $location.path('app/home');
          var userLogin = {};
          userLogin['UserId'] = $scope.userName;
          userLogin['Password'] = $scope.password;

          //var loginURL= "http://rocuat.tmf.co.in/Tmanager/webresources/generic/Login";
          var loginURL= "http://172.16.17.70:8080/Tmanager/webresources/generic/Login";
          var networkState = '';
          if (navigator.connection == null) {
               networkState = "unknown";
          } else {
            networkState = navigator.connection.type;
          }

          if (networkState == "2g" || networkState == "3g" || networkState == "4g" || networkState == "wifi" || networkState == "none" || networkState == "unknown") {
            $http.post(loginURL, userLogin).
                success(function (data) {
                  if(data.status == 'Login Sucessfull') {
                    $location.path('app/home');
                  } else if(data.status == 'Login Failed') {
                    $scope.loading = false;
                    alert('Please enter correct Username and Password.');
                  }
                });
          } else if(networkState == "none" || networkState == "unknown") {
            $scope.loading = false;
            alert('Please check your internet connection and try again.');
          }
        }
    }

}]);

myApp.controller('appCtrl', ['$window', '$state', '$scope', function($window, $state, $scope) {
  $scope.logout = function() {
    $state.go('login');
  }
}]);

myApp.controller('homeCtrl', ['$scope', '$state', function($scope, $state) {

  $scope.title = "Dashboard";
  var height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);
  var calculatedHeight = (height);
  $('.home-wrapper .content-wrapper').css('height', calculatedHeight - 45);

  $scope.createRequest = function(mode) {
    $state.go('app.create-request', {mode: mode});
  };

}]);

myApp.controller('newRequestCtrl', ['$scope', '$state', '$cordovaSQLite', '$location', function($scope, $state, $cordovaSQLite, $location) {

  $scope.title = "Create Request";
  var mode = $state.params.mode;

  $scope.validateFromPlace = function() {
    if($scope.fromPlace) {
      $scope.validateFromStatus = true;
    }
  };

  $scope.validateDestination = function() {
    if($scope.destination) {
      $scope.validateDestinationStatus = true;
    }
  };

  $scope.validateApprover = function() {
    if($scope.approver) {
      $scope.validateApproverStatus = true;
    }
  };

  $scope.save = function(dataToSave) {
      $cordovaSQLite.execute(db, 'INSERT INTO MyRequest (visit_purpose, depart_from, destination, departure_date, departure_time, accomodation_required, accomodation_from_date, accomodation_to_date, transportation_status, approver, mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', dataToSave)
          .then(function(result) {
              $location.path('app/my-request');
          }, function(error) {
              console.log("Error on saving: " + error.message);
          })
  }

  $scope.requestFormSubmit = function(isValid) {
        $scope.submitted = true;
        $scope.validateFromStatus = false;
        $scope.validateDestinationStatus = false;
        $scope.validateApproverStatus = false;

        $scope.validateFromPlace();
        $scope.validateDestination();
        $scope.validateApprover();

        if(isValid && $scope.validateFromStatus && $scope.validateDestinationStatus && $scope.validateApproverStatus) {
          var visitPurpose         = '',
              fromPlace            = '',
              destination          = '',
              departureDate        = '',
              departureTime        = '',
              accomodationStatus   = 'No',
              accomodationDate     = '',
              accomodationTime     = '',
              transportationStatus = 'No',
              approver             = '';

          visitPurpose = $scope.visitPurpose;
          fromPlace    = $scope.fromPlace;
          destination  = $scope.destination;
          departureDate = $scope.departureDate;
          departureTime = $scope.departureTime;

          if($scope.accomodationDate ) {
            accomodationStatus = 'Yes';
            accomodationDate = $scope.accomodationDate;
            accomodationTime = $scope.accomodationTime;
          }

          if($scope.transportationStatus) {
            transportationStatus = 'Yes';
          }

          approver = $scope.approver;

          var dataToSave = [visitPurpose, fromPlace, destination, departureDate, departureTime, accomodationStatus, accomodationDate, accomodationTime, transportationStatus, approver, mode];

          $scope.save(dataToSave);
        }
  };

}]);

myApp.controller('myRequestsCtrl', ['$scope', '$state', '$cordovaSQLite', '$ionicLoading', 'Request', function($scope, $state, $cordovaSQLite, $ionicLoading, Request) {

  $scope.title = "My Request";

  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $scope.requestData = [];
  $scope.requestData = null;

  $scope.updateRequestData = function() {
    Request.all().then(function(data) {
        $scope.requestData = data;
        $ionicLoading.hide();
      });
    }

  $scope.updateRequestData();

  $scope.requestDetailPage = function(requestId, approve) {
    $state.go('app.request-detail', {requestId: requestId, action: approve});
  }

}]);

myApp.controller('requestDetailCtrl', ['$scope', '$state', 'Request', '$ionicLoading', function($scope, $state, Request, $ionicLoading) {

  $scope.title = "Request Details";
  var requestId = $state.params.requestId;
  var action = $state.params.action;

  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $scope.requestData = [];
  $scope.requestData = null;

  $scope.updateRequestData = function() {
    Request.get(requestId).then(function(data) {
        $scope.requestData = data;
        $ionicLoading.hide();
      });
    }

  $scope.updateRequestData();
}]);

myApp.controller('pendingApprovalCtrl', ['$scope', '$state', function($scope, $state) {

  $scope.title = "Pending Approvals";

  $scope.requestDetailPage = function(requestId, approve) {
    $state.go('app.request-detail', {requestId: requestId, action: approve});
  }
}]);
