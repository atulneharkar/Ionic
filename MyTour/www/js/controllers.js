var myApp = angular.module('starter');

myApp.controller('splashCtrl', ['$window', '$state', function($window, $state) {
  var height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);
  var calculatedHeight = (height);
  $('.splash-wrapper .main-wrapper').css('height', calculatedHeight);

  $window.setTimeout(function () {
    $state.go('login');
  }, 3000);

}]);

myApp.controller('loginCtrl', ['$window', '$scope', '$location', '$http', '$cordovaSQLite', function($window, $scope, $location, $http, $cordovaSQLite) {

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

myApp.controller('appCtrl', ['$state', '$scope', function($state, $scope) {
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

myApp.controller('requestCtrl', ['$scope', '$cordovaSQLite', '$state', 'Request', '$ionicLoading', function($scope, $cordovaSQLite, $state, Request, $ionicLoading) {

  var mode = $state.params.mode;
  $scope.requestId = $state.params.requestId;

  $scope.mode = mode;

  $scope.requestData = [];
  $scope.requestData = null;

  if($scope.requestId) {
    $scope.title = "Update Request";

    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

    $scope.updateRequestData = function() {
      Request.get($scope.requestId, 'MyRequest').then(function(data) {
        $scope.requestData = data;
        $ionicLoading.hide();

        $scope.visitPurpose = data.myRequests[0].visit_purpose;
        $scope.fromPlace = data.myRequests[0].depart_from;
        $scope.destination = data.myRequests[0].destination;
        $scope.departureDate = new Date(data.myRequests[0].departure_date);
        $scope.departureTime = new Date(data.myRequests[0].departure_time);

        if(data.myRequests[0].accomodation_required == 'Yes') {
          accomodationStatus = 'Yes';
          $scope.accomodationStatus = true;
          $scope.accomodationFromDate = new Date(data.myRequests[0].accomodation_from_date);
          $scope.accomodationToDate = new Date(data.myRequests[0].accomodation_to_date);
        }

        if(data.myRequests[0].transportation_status == 'Yes') {
          transportationStatus = 'Yes';
          $scope.transportationStatus = true;
        }

        $scope.approver = data.myRequests[0].approver;
      });
    }

    $scope.updateRequestData();
  } else {
    $scope.title = "Create Request";
  }

  $scope.changeMode = function() {
    mode = $scope.mode;
  };

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
              accomodationFromDate = '',
              accomodationToDate   = '',
              transportationStatus = 'No',
              approver             = '',
              activeStatus         = 1,
              remarks              = '';

          visitPurpose = $scope.visitPurpose;
          fromPlace    = $scope.fromPlace;
          destination  = $scope.destination;
          departureDate = new Date($scope.departureDate).getTime();
          departureTime = new Date($scope.departureTime).getTime();

          if($scope.accomodationStatus) {
            accomodationStatus = 'Yes';
            accomodationFromDate = new Date($scope.accomodationFromDate).getTime();
            accomodationToDate = new Date($scope.accomodationToDate).getTime();
          }

          if($scope.transportationStatus) {
            transportationStatus = 'Yes';
          }

          approver = $scope.approver;

          var dataToSave = [visitPurpose, fromPlace, destination, departureDate, departureTime, accomodationStatus, accomodationFromDate, accomodationToDate, transportationStatus, approver, mode, activeStatus, remarks];

          if($scope.requestId) {
            dataToSave.push($scope.requestId);
            $scope.update(dataToSave);
          } else {
            $scope.save(dataToSave);
          }
        }
  };

  $scope.save = function(dataToSave) {
    Request.add(dataToSave).then(function() {
      $state.go('app.my-request', {}, {reload: true});
    });
  }

  $scope.update = function(dataToSave) {
    Request.update(dataToSave).then(function() {
      $state.go('app.my-request', {}, {reload: true});
    });
  }

}]);

myApp.controller('myRequestsCtrl', ['$scope', '$state', '$cordovaSQLite', '$ionicLoading', 'Request', function($scope, $state, $cordovaSQLite, $ionicLoading, Request) {

  $scope.title = "My Request";

  $scope.$on('$ionicView.beforeEnter', function(e, config) {
    config.enableBack = false;
  });

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
    Request.all('MyRequest').then(function(data) {
      $scope.requestData = data;
      $ionicLoading.hide();
    });
  }

  $scope.updateRequestData();

  $scope.requestDetailPage = function(requestId, status) {
    $state.go('app.request-detail', {requestId: requestId, action: status});
  }

}]);

myApp.controller('requestDetailCtrl', ['$scope', '$state', 'Request', '$ionicLoading', '$window', function($scope, $state, Request, $ionicLoading, $window) {

  $scope.title = "Request Details";
  var requestId = $state.params.requestId;
  $scope.action = $state.params.action;

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
    Request.get(requestId, 'MyRequest').then(function(data) {
      $scope.requestData = data;
      $ionicLoading.hide();
    });
  }

  $scope.cancelRequest = function(requestId) {
    var confirmCancel = confirm('Are you sure you want to cancel the request?');
    if(confirmCancel) {
      Request.cancel(requestId).then(function() {
        $state.go('app.my-request', {}, { reload: true });
      });
    }
  }

  $scope.onRemarksInput = function() {
    if($scope.remarks) {
      $scope.remarksPending = false;
    }
  }

  $scope.approval = function(status, requestId) {
    $scope.remarksPending = true;
    $scope.onRemarksInput();

    var confirmApproval;
    if(status == 'approve') {
      confirmApproval = confirm('Are you sure you want to approve the request?');
    } else if(status == 'reject') {
      if(!$scope.remarksPending) {
        confirmApproval = confirm('Are you sure you want to reject the request?');
      }
    }
    if(confirmApproval) {
      Request.updateApprovalStatus(status, requestId).then(function() {
        $state.go('app.my-request', {}, { reload: true });
      });
    }
  }

  $scope.updateRequestData();
}]);

myApp.controller('pendingApprovalCtrl', ['$scope', '$state', '$cordovaSQLite', '$ionicLoading', 'Request', function($scope, $state, $cordovaSQLite, $ionicLoading, Request) {

  $scope.title = "Pending Approvals";

  $scope.$on('$ionicView.beforeEnter', function(e, config) {
    config.enableBack = false;
  });

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
    Request.all('PendingApproval').then(function(data) {
      $scope.requestData = data;
      $ionicLoading.hide();
    });
  }

  $scope.updateRequestData();

  $scope.requestDetailPage = function(requestId, status) {
    $state.go('app.request-detail', {requestId: requestId, action: status});
  }
}]);
