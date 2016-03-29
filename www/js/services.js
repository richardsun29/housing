angular.module('services', ['ngStorage'])

.factory('Apartments', ['$http', '$q', 'Favorites',
function($http, $q, Favorites) {
  var endpoint = 'http://dev.bruinmobile.com/housing/getAptData.php';

  var apartments = [];
  var featured = [];

  var fetch = function() {
    var deferred = $q.defer();
    $http.get(endpoint).then(function(response) {
      var data = {};

      featured = formatApts(response.data.featured_apt_data);

      var main = formatApts(response.data.main_apt_data);
      main.forEach(function(apt) {
        apartments[apt.id] = apt; // map index == id
      });

      deferred.resolve(apartments);
    }, function(error) {
      deferred.reject(error);
    });
    return deferred.promise;
  };

  /* raw database response -> app format
   * Use default property names/values unless you want to change */
  var formatApts = function(apts) {
    return apts.map(function(apt) {

      // image_path -> {large, med, small}
      apt.images = imgUrls(apt);

      // favorite time
      Favorites.setMtime(apt);

      // meters -> miles
      apt.distance_to_campus = apt.distance_to_campus / 1609.34;

      return apt;
    });
  };

  var imgUrls = function(apt) {
    var url = 'http://dev.bruinmobile.com/housing/images/';
    var sizes = ['thumb', 'med', 'large'];

    if (apt.image_path) {
      var images = {};
      sizes.forEach(function(size) {
        if (RegExp('http://').test(apt.image_path)) // if outside image is given
          images[size] = apt.image_path;
        else
          images[size] = url + size + '/' + apt.image_path;
      });
      return images;
    }

    return undefined;
  };

  var waitForFetch = function(deferred, callback) {
    if (apartments.length == 0) {
      fetch().then(function() {
        deferred.resolve(callback());
      });
    } else {
      deferred.resolve(callback());
    }
  };

  var getMain = function() {
    var deferred = $q.defer();
    waitForFetch(deferred, function() {
      return apartments;
    });
    return deferred.promise;
  };

  var getFeatured = function() {
    var deferred = $q.defer();
    waitForFetch(deferred, function() {
      return featured;
    });
    return deferred.promise;
  };

  var getId = function(id) {
    var deferred = $q.defer();
    waitForFetch(deferred, function() {
      return apartments[id];
    });
    return deferred.promise;
  };

  return {
    getAll: getMain,
    getFeatured: getFeatured,
    getId: getId,
  }
}])

.factory('Favorites', ['$localStorage', '$q',
function($localStorage, $q) {

  $localStorage.favorites = $localStorage.favorites || {};
  var favorites = $localStorage.favorites;

  var add = function(apt) {
    favorites[apt.id] = Date.now(); // save time when apt was favorited
    apt.favorite_mtime = favorites[apt.id];
    return true;
  };

  var remove = function(apt) {
    delete favorites[apt.id];
    delete apt.favorite_mtime;
    return false;
  };

  var toggle = function(apt) {
    return isFavorited(apt) ? remove(apt) : add(apt);
  };

  var isFavorited = function(apt) {
    return !!apt.favorite_mtime;
  };

  // set favorite_mtime in the apartment object
  var setMtime = function(apt) {
    if (favorites[apt.id])
      apt.favorite_mtime = favorites[apt.id];
  };

  return {
    add: add,
    remove: remove,
    toggle: toggle,
    isFavorited: isFavorited,
    setMtime: setMtime
  };
}])

.factory('Maps', ['$http', '$q',
function($http, $q) {
  var zip = '90024'; // Westwood

  var encodeAddress = function(address) {
    return address.replace(/ /g, '+');
  };

  /* Address hyperlink */
  var appleMapsUrl = (function() {
    var endpoint = 'http://maps.apple.com/?address=';
    return function(address) {
      // remove multiple house numbers, eg. '412-430 Kelton'
      address = address.match(/\d+[A-Za-z ]+/)[0];
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
}])

.factory('AptModal', ['$ionicModal', 'Maps', 'Favorites',
function($ionicModal, Maps, Favorites) {
  var detailTemplate = 'templates/detail.html';

  var get = function(scope) {
    return $ionicModal.fromTemplateUrl(detailTemplate, {
      scope: scope,
      animation: 'slide-in-up',
      backdropClickToClose: true
    });
  };

  /* calling "AptModal.source.call($scope)" adds the following properties to
   * the $scope passed in:
   * $scope.modal {Object}: the detail modal
   * $scope.openModal(apt) {function}: opens modal with the given apartment
   * $scope.apt {Object}: the apartment shown in the modal
   * $scope.favorited {Boolean}: whether $scope.apt is favorited
   * $scope.toggleFavorite {function}: toggle $scope.apt's favorited status
   * $scope.closeModal() {function}: close the modal
   */
  var source = function() {
    var scope = this;

    get(scope).then(function(modal) {
      scope.modal = modal;
    });

    scope.openModal = function(apt) {
      scope.modal.show().then(function() {
        scope.apt = apt;

        /* maps */
        scope.mapsUrl = Maps.url(apt.address);
        if (apt.latitude && apt.longitude) {
          var coords = {
            latitude: apt.latitude,
            longitude: apt.longitude,
            id: 0
          };
          scope.map = {
            markers: [coords],
            center: angular.copy(coords) // let map pan without moving marker
          };
        }
        else {
          // if not in database, get coords from google maps
          Maps.coords(apt.address).then(function(coords) {
            coords.id = 0;
            scope.map = {
              markers: [coords],
              center: angular.copy(coords)
            };
          });
        }

        /* favorites */
        scope.favorited = Favorites.isFavorited(scope.apt);

      });
    };

    /* favorites */
    scope.toggleFavorite = function() {
      if (scope.apt)
        scope.favorited = Favorites.toggle(scope.apt);
    };

    /* modal cleanup */
    scope.closeModal = function() {
      scope.modal.hide().then(function() {
        scope.apt = {image_path: ' '}; // prevents previous image from showing
      });
    };
    scope.$on('$destroy', function() {
      scope.modal.remove();
    });

  };

  return {
    get: get,
    source: source
  };
}])

.factory('Search', ['$ionicPopup',
function($ionicPopup) {

  var ranges = {
      rent: {
        text: 'Monthly Rent',
        min: 0,
        max: 5000,
        step: 100
      },
      distance: {
        text: 'Distance to campus',
        min: 0,
        max: 3,
        step: 0.1
      },
      bed: {
        text: 'Bedrooms',
        min: 0,
        max: 5,
        step: 1
      },
      bath: {
        text: 'Bathrooms',
        min: 0,
        max: 5,
        step: 1
      }
  };

  var show = function(scope) {
    var popup = {
        templateUrl: 'templates/search.html',
        title: 'Filter Results',
        scope: scope,
        buttons: [{
          text: '<b>Done</b>',
          type: 'button-positive',
        }]
    };

    return function() {
      $ionicPopup.show(popup);
    };
  };

  var filter = {};

  var clearFilters = function() {
    for (var i in ranges)
      filter[i] = { from: ranges[i].min, to: ranges[i].max };
  };
  clearFilters();

  return {
    show: show,
    ranges: ranges,
    filter: filter,
    clearFilters: clearFilters
  };
}])

.filter('SearchFilter', function() {
  /* filter -> database property */
  var map = {
    rent: 'monthly_rent_avg',
    distance: 'distance_to_campus'
  };

  return function(apts, filter) {
    return apts.filter(function(apt) {
      for (var key in filter) {
        var curr = filter[key];
        if (!curr)
          continue;
        var min = curr.from;
        var max = curr.to;

        var prop = map[key];
        if (!prop)
          continue;

        var val = parseFloat(apt[prop]);
        if (!val || val < min || val > max)
          return false;
      }
      return true;
    });
  };
})

;
