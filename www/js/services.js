angular.module('starter.services', ['ngStorage'])

.factory('Apartments', function($http, $q) {
  var endpoint = 'http://dev.bruinmobile.com/housing/getAptData.php';

  var apartments = {};
  var featured = [];

  var fetch = function() {
    var deferred = $q.defer();
    $http.get(endpoint).then(function(response) {
      var data = {};
      response.data.main_apt_data.forEach(function(apt) {
        apartments[apt.id] = apt;
      });
      featured = response.data.featured_apt_data;

      deferred.resolve(response.data.main_apt_data);
    }, function(error) {
      deferred.reject(error);
    });
    return deferred.promise;
  };

  var getMain = function() {
    return fetch();
  };

  var getFeatured = function() {
    var deferred = $q.defer();
    if (Object.keys(apartments).length == 0) {
      fetch().then(function() {
        deferred.resolve(featured);
      });
    } else {
      deferred.resolve(featured);
    }
    return deferred.promise;
  };

  var getId = function(id) {
    var deferred = $q.defer();
    if (Object.keys(apartments).length == 0) {
      fetch().then(function() {
        deferred.resolve(apartments[id]);
      });
    } else {
      deferred.resolve(apartments[id]);
    }
    return deferred.promise;
  };



  return {
    getMain: getMain,
    getFeatured: getFeatured,
    getId: getId,
  }
})

.factory('Favorites', function($localStorage) {
  $localStorage.$reset(); // for debugging
  $localStorage.favorites = $localStorage.favorites || [];
  var favorites = $localStorage.favorites;

  var isFavorited = function(id) {
    return favorites[id];
  };

  var add = function(id) {
    favorites[id] = true;
    return true;
  };

  var remove = function(id) {
    delete favorites[id];
    return false;
  };

  var toggle = function(id) {
    if (isFavorited(id))
      return remove(id);
    else
      return add(id);
  };

  var getAll = function(id) {
    return favorites;
  };

  return {
    add: add,
    remove: remove,
    toggle: toggle,
    isFavorited: isFavorited,
    getAll: getAll
  };
});
