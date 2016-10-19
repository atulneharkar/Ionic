myApp.factory('DBA', function($cordovaSQLite, $q, $ionicPlatform) {
  var self = this;

  // Handle query's and potential errors
  self.query = function (query, parameters) {
    parameters = parameters || [];
    var q = $q.defer();

    $ionicPlatform.ready(function () {
      $cordovaSQLite.execute(db, query, parameters)
      .then(function (result) {
        q.resolve(result);
      }, function (error) {
        console.warn('I found an error');
        console.warn(error);
        q.reject(error);
      });
    });

    return q.promise;
  }

  // Proces a result set
  self.getAll = function(result) {
    var obj = self.createObject(result);
    return obj;
  }

  // Proces a single result
  self.getById = function(result) {
    var obj = self.createObject(result);
    return obj;
  }

  self.createObject = function(result) {
    var requestObj = {
      myRequests: [],
      pendingApprovals: []
    };

    if (result.rows.length > 0) {
      for(var i = 0; i < result.rows.length; i++) {
        var obj = {
          'id': result.rows.item(i).id,
          'visit_purpose': result.rows.item(i).visit_purpose,
          'depart_from': result.rows.item(i).depart_from,
          'destination': result.rows.item(i).destination,
          'departure_date': result.rows.item(i).departure_date,
          'departure_time': result.rows.item(i).departure_time,
          'accomodation_required': result.rows.item(i).accomodation_required,
          'accomodation_from_date': result.rows.item(i).accomodation_from_date,
          'accomodation_to_date': result.rows.item(i).accomodation_to_date,
          'transportation_status': result.rows.item(i).transportation_status,
          'approver': result.rows.item(i).approver,
          'mode': result.rows.item(i).mode
        };
        requestObj.myRequests.push(obj);
      }
    }

    return requestObj;
  }

  return self;
});

myApp.factory('Request', function ($cordovaSQLite, DBA) {
  var self = this;

  self.all = function() {
    var result = DBA.query('SELECT * FROM MyRequest ORDER BY id DESC').then(function(result){
      return DBA.getAll(result);
    });
    return result;
  }

  self.get = function(id) {
    var parameters = [id];
    return DBA.query("SELECT * FROM MyRequest WHERE id = (?)", parameters)
      .then(function(result) {
        return DBA.getById(result);
      });
  }

  return self;
});
