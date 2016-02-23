angular.module('services', ['ngStorage'])

.factory('Apartments', ['$http', '$q', 'Images',
function($http, $q, Images) {
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
      // TEMPORARY: insert image links
      apt.image_path = Images.full(apt.entity_id);
      apt.thumbnail = Images.thumb(apt.entity_id);

      return apt;
    });
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

  var getPage = function(page) {
    var perPage = 10;
    var start = page * perPage;
    var deferred = $q.defer();

    waitForFetch(deferred, function() {
      return apartments.slice(start, start + perPage);
    });
    return deferred.promise;
  }

  return {
    getAll: getMain,
    getFeatured: getFeatured,
    getId: getId,
    getPage: getPage,
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

.factory('Images', function() {
  // images: entity_id -> basename
  var images = {
    5993: "CIMG4486.JPG", 5963: "CIMG4826.JPG", 5964: "CIMG4491.JPG",
    5965: "CIMG4679.JPG", 5967: "CIMG4693.JPG", 5968: "CIMG4376.JPG",
    5969: "CIMG4625.JPG", 5970: "CIMG4751.JPG", 5971: "CIMG4467.JPG",
    5972: "CIMG4661.JPG", 5973: "CIMG4402.JPG", 5974: "CIMG4659.JPG",
    5975: "CIMG4387.JPG", 5976: "CIMG4703.JPG", 5977: "CIMG4694.JPG",
    5978: "CIMG4715.JPG", 5979: "CIMG4442.JPG", 5980: "CIMG4668.JPG",
    5982: "CIMG4662.JPG", 5983: "CIMG4641.JPG", 5984: "CIMG4732.JPG",
    5985: "CIMG4666.JPG", 5986: "CIMG4411.JPG", 5987: "CIMG4698.JPG",
    5988: "CIMG4646.JPG", 5989: "CIMG4687.JPG", 5990: "CIMG4654.JPG",
    5991: "CIMG4396.JPG", 5992: "CIMG4635.JPG", 5994: "CIMG4401.JPG",
    5995: "CIMG4829.JPG", 5996: "CIMG4830.JPG", 5997: "CIMG4664.JPG",
    5998: "CIMG4568.JPG", 5999: "CIMG4606.JPG", 6000: "CIMG4294.JPG",
    6002: "CIMG4426.JPG", 6003: "CIMG4774.JPG", 6005: "CIMG4493.JPG",
    6006: "CIMG4495.JPG", 6007: "CIMG4388.JPG", 6008: "CIMG4379.JPG",
    6009: "CIMG4405.JPG", 6010: "CIMG4717.JPG", 6011: "CIMG4482.JPG",
    6012: "CIMG4672.JPG", 6013: "CIMG4395_.JPG", 6014: "CIMG4696.JPG",
    6015: "CIMG4674.JPG", 6017: "CIMG4722.JPG", 6019: "CIMG4649.JPG",
    6020: "CIMG4622.JPG", 6021: "CIMG4542.JPG", 6022: "CIMG4644.JPG",
    6023: "CIMG4825.JPG", 6024: "CIMG4614.JPG", 6025: "CIMG4677.JPG",
    6027: "CIMG4834.JPG", 6028: "CIMG4496.JPG", 6029: "CIMG4505.JPG",
    6030: "CIMG4370.JPG", 6031: "CIMG4719.JPG", 6032: "CIMG4300.JPG",
    6033: "CIMG4640.JPG", 6034: "CIMG4712.JPG", 6035: "CIMG4472.JPG",
    6036: "CIMG4309_.JPG", 6037: "CIMG4469.JPG", 6038: "CIMG4454.JPG",
    6039: "CIMG4691.JPG", 6040: "CIMG4435.JPG", 6041: "CIMG4724.JPG",
    6042: "CIMG4508.JPG", 6044: "CIMG4759.JPG", 6045: "CIMG4602.JPG",
    6046: "CIMG4775.JPG", 6047: "CIMG4629.JPG", 6048: "CIMG4368.JPG",
    6049: "CIMG4743.JPG", 6051: "CIMG4553.JPG", 6052: "CIMG4464.JPG",
    6053: "CIMG4476.JPG", 6055: "CIMG4531.JPG", 6056: "CIMG4348.JPG",
    6057: "CIMG4359.JPG", 6058: "CIMG4767.JPG", 6060: "CIMG4568__.JPG",
    6061: "CIMG4471_.JPG", 6062: "CIMG4317.JPG", 6063: "CIMG4288.JPG",
    6064: "CIMG4463.JPG", 6065: "CIMG4571.JPG", 6066: "CIMG4502.JPG",
    6067: "CIMG4575.JPG", 6068: "CIMG4490.JPG", 6069: "CIMG4295.JPG",
    6070: "CIMG4461.JPG", 6071: "CIMG4503.JPG", 6072: "CIMG4642.JPG",
    6073: "CIMG4336.JPG", 6074: "CIMG4384.JPG", 6075: "CIMG4345.JPG",
    6076: "CIMG4701.JPG", 6077: "CIMG4499.JPG", 6078: "CIMG4827.JPG",
    6079: "CIMG4652.JPG", 6080: "CIMG4555.JPG", 6081: "CIMG4760.JPG",
    6082: "CIMG4823.JPG", 6084: "CIMG4513.JPG", 6085: "CIMG4763.JPG",
    6086: "CIMG4742.JPG", 6087: "CIMG4726.JPG", 6089: "415-Gayley.jpg",
    6090: "CIMG4512.JPG", 6091: "CIMG4779.JPG", 6092: "CIMG4624.JPG",
    6093: "CIMG4326.JPG", 6094: "CIMG4367.JPG", 6095: "CIMG4731.JPG",
    6096: "CIMG4517.JPG", 6097: "CIMG4507.JPG", 6098: "CIMG4347.JPG",
    6099: "CIMG4483.JPG", 6100: "CIMG4509.JPG", 6101: "CIMG4510.JPG",
    6102: "CIMG4709.JPG", 6104: "CIMG4327.JPG", 6105: "CIMG4599.JPG",
    6106: "CIMG4441.JPG", 6107: "CIMG4777.JPG", 6108: "CIMG4651.JPG",
    6109: "CIMG4433.JPG", 6111: "CIMG4374.JPG", 6112: "CIMG4506.JPG",
    6113: "CIMG4340.JPG", 6114: "CIMG4465.JPG", 6115: "CIMG4590.JPG",
    6116: "CIMG4656.JPG", 6117: "CIMG4436.JPG", 6118: "CIMG4519.JPG",
    6119: "CIMG4381.JPG", 6120: "CIMG4309.JPG", 6121: "CIMG4334.JPG",
    6122: "CIMG4293.JPG", 6123: "CIMG4500.JPG", 6125: "CIMG4487.JPG",
    6126: "CIMG4539.JPG", 6127: "CIMG4446.JPG", 6129: "CIMG4306.JPG",
    6130: "CIMG4564.JPG", 6131: "CIMG4475.JPG", 6132: "CIMG4283.JPG",
    6133: "CIMG4516.JPG", 6134: "CIMG4466.JPG", 6135: "CIMG4748.JPG",
    6136: "CIMG4770.JPG", 6137: "CIMG4430.JPG", 6138: "CIMG4431.JPG",
    6139: "CIMG4315.JPG", 6140: "CIMG4828.JPG", 6141: "CIMG4290.JPG",
    6142: "CIMG4285.JPG", 6143: "CIMG4407.JPG", 6144: "CIMG4554.JPG",
    6145: "CIMG4557.JPG", 6146: "CIMG4363.JPG", 6147: "CIMG4520.JPG",
    6149: "CIMG4414.JPG", 6150: "CIMG4286.JPG", 6151: "CIMG4560.JPG",
    6152: "CIMG4439.JPG", 6153: "CIMG4548.JPG", 6154: "CIMG4559.JPG",
    6155: "CIMG4738.JPG", 6156: "CIMG4529.JPG", 6157: "CIMG4447.JPG",
    6160: "CIMG4593.JPG", 6161: "CIMG4618.JPG", 6162: "CIMG4480.JPG",
    6163: "CIMG4318.JPG", 6164: "CIMG4438.JPG", 6165: "CIMG4449.JPG",
    6166: "CIMG4525.JPG", 6167: "CIMG4440.JPG", 6168: "CIMG4477.JPG",
    6169: "CIMG4420.JPG", 6170: "CIMG4638.JPG", 6171: "CIMG4567.JPG",
    6172: "CIMG4537.JPG", 6173: "CIMG4550.JPG", 6174: "CIMG4458.JPG",
    6175: "CIMG4450.JPG", 6176: "CIMG4324.JPG", 6177: "CIMG4609.JPG",
    6178: "CIMG4699.JPG", 6179: "CIMG4342.JPG", 6180: "CIMG4456_.JPG",
    6181: "CIMG4437.JPG", 6182: "CIMG4540.JPG", 6183: "CIMG4329.JPG",
    6184: "CIMG4446_.JPG", 6185: "CIMG4535.JPG", 6186: "CIMG4392.JPG",
    6187: "CIMG4321.JPG", 6188: "CIMG4460.JPG", 6189: "CIMG4824.JPG",
    6190: "CIMG4332.JPG", 6191: "CIMG4523.JPG", 6192: "CIMG4303.JPG",
    6193: "CIMG4584.JPG", 6196: "CIMG4603.JPG", 6197: "CIMG4680.JPG",
    6198: "CIMG4371.JPG", 6199: "CIMG4547.JPG"
  };

  var url = 'http://dev.bruinmobile.com/housing/images/';

  var get = function(subdirectory, entity_id) {
    if (images[entity_id])
      return url + subdirectory + images[entity_id];
    else
      return undefined;
  };

  return {
    full: function(entity_id) {
      return get('full/', entity_id);
    },
    thumb: function(entity_id) {
      return get('thumb/', entity_id);
    }
  };
})

.factory('AptModal', ['$ionicModal', 'Maps', 'Favorites',
function($ionicModal, Maps, Favorites) {
  var detailTemplate = 'templates/detail.html';

  var get = function(scope) {
    return $ionicModal.fromTemplateUrl(detailTemplate, {
      scope: scope,
      animation: 'slide-in-up',
      backdropClickToClose: false
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

;
