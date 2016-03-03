angular.module('services', ['ngStorage'])

.factory('Apartments', ['$http', '$q',
function($http, $q) {
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
      apt.images = imgUrls(apt);

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

.factory('Favorites', ['$localStorage', '$q', 'Apartments',
function($localStorage, $q, Apartments) {
  $localStorage.favorites = $localStorage.favorites || {};
  var favorites = $localStorage.favorites;

  var favoriteApts = [];
  var favoriteAptsPromise = $q.defer();
  if (Object.keys(favorites).length == 0)
    favoriteAptsPromise.resolve();
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
    return isFavorited(id) ? remove(id) : add(id);
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
        Maps.coords(apt.address).then(function(coords) {
          var markers = [{
            latitude: coords.latitude,
            longitude: coords.longitude,
            id: 0
          }];
          scope.map = {
            center: coords,
            markers: markers
          };
        });

        /* favorites */
        scope.favorited = Favorites.isFavorited(scope.apt.id);

      });
    };

    /* favorites */
    scope.toggleFavorite = function() {
      if (scope.apt)
        scope.favorited = Favorites.toggle(scope.apt.id);
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

.factory('Search', ['$ionicPopup', 'SearchRanges',
function($ionicPopup, SearchRanges) {

  var show = function(scope) {

    var closeBtn = {
      text: 'Close',
      type: 'button-dark button-outline'
    };

    var searchBtn = {
      text: '<b>Done</b>',
      type: 'button-positive',
      onTap: function(e) {
        console.log(scope.filter);
      }
    };

    return function() {
      $ionicPopup.show({
        templateUrl: 'templates/search.html',
        title: 'Filter Results',
        scope: scope,
        buttons: [searchBtn]
      });
    };
  };

  return {
    show: show,
    ranges: SearchRanges,
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
        var max = curr.max;
        var min = curr.min;

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

.constant('SearchRanges', (function() {

  var max = Number.POSITIVE_INFINITY; // just in case
  var min = Number.NEGATIVE_INFINITY;

  return {
    rent: [
      { text: '< $1000', min: min, max: 1000 },
      { text: '$1000 - $2000', min: 1000, max: 2000 },
      { text: '$2000 - $3000', min: 2000, max: 3000 },
      { text: '> $3000', min: 3000, max: max }
    ],
    distance: [
      { text: '< .5 miles', min: min, max: 0.5 },
      { text: '.5 - 1 miles', min: 0.5, max: 1.0 },
      { text: '1 - 2 miles', min: 1, max: 2 },
      { text: '> 2 miles', min: 2, max: max }
    ],
    bed: [
      { text: '0', min: 0, max: 0 },
      { text: '1', min: 1, max: 1 },
      { text: '2', min: 2, max: 2 },
      { text: '3+', min: 3, max: max }
    ],
    bath: [
      { text: '0', min: 0, max: 0 },
      { text: '1', min: 1, max: 1 },
      { text: '2', min: 2, max: 2 },
      { text: '3+', min: 3, max: max }
    ],
  };
})())

;
