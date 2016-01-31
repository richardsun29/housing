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

.factory('Favorites', function($localStorage, $q, Apartments) {
  //$localStorage.$reset(); // for debugging
  $localStorage.favorites = $localStorage.favorites || {};
  var favorites = $localStorage.favorites;

  var favoriteApts = [];
  var favoriteAptsPromise = $q.defer();
  for (var i in favorites) {
    Apartments.getId(i).then(function(apt) {
      favoriteApts.push(apt);
      if (favoriteApts.length >= Object.keys(favorites).length) {
        favoriteAptsPromise.resolve();
      }
    });
  }

  var isFavorited = function(id) {
    return favorites[id];
  };

  var add = function(id) {
    if (!favorites[id]) {
      favorites[id] = true;
      Apartments.getId(id).then(function(apt) {
        favoriteApts.push(apt);
      });
    }
    return true;
  };

  var remove = function(id) {
    if (favorites[id]) {
      delete favorites[id];
      for (var i in favoriteApts)
        if (favoriteApts[i].id == id) {
          favoriteApts.splice(i, 1);
          break;
        }
    }
    return false;
  };

  var toggle = function(id) {
    if (isFavorited(id))
      return remove(id);
    else
      return add(id);
  };

  var getFavoriteApts = function(id) {
    var deferred = $q.defer();
    favoriteAptsPromise.promise.then(function() {
      deferred.resolve(favoriteApts);
    });
    return deferred.promise;
  };

  return {
    add: add,
    remove: remove,
    toggle: toggle,
    isFavorited: isFavorited,
    get: getFavoriteApts
  };
})

.factory('Maps', function($http, $q, Apartments) {
  var zip = '90024'; // Westwood

  var encodeAddress = function(address) {
    return address.replace(/ /g, '+');
  };

  /* Address hyperlink */
  var appleMapsUrl = (function() {
    var endpoint = 'http://maps.apple.com/?address=';
    return function(address) {
      return endpoint + encodeAddress(address) + '+' + zip;
    };
  })();

  var addressToCoords = (function() {
    var endpoint = 'https://maps.googleapis.com/maps/api/geocode/json';
    var key = 'AIzaSyCxxHY4QFpofM-K0RoQZVn93dOCm74Vs0o';
    var url = endpoint+'?key='+key+'&components=postal_code:'+zip+'&address=';
    return function(address) {
      var deferred = $q.defer();
      $http.get(url + encodeAddress(address)).then(function(response) {
        var coords = response.data.results[0].geometry.location;
        deferred.resolve({
          latitude: coords.lat,
          longitude: coords.lng
        });
      });

      return deferred.promise;
    };
  })();

  return {
    url: appleMapsUrl,
    coords: addressToCoords
  };
})
;
