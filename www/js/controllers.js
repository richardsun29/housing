angular.module('controllers', ['uiGmapgoogle-maps'])

.controller('TabsCtrl', ['$state', '$scope',
function($state, $scope) {
  $scope.goto = function(state, params) {
    $state.go(state, params);
  };
}])

.controller('FeaturedCtrl', ['$scope', 'Apartments',
function($scope, Apartments) {
  Apartments.getFeatured().then(function(response) {
    $scope.apts = response;
    console.log($scope.apts);
  });
}])

.controller('ListCtrl', ['$scope', '$ionicPopup', 'AptModal', 'Apartments',
    'Maps', 'Favorites',
function($scope, $ionicPopup, AptModal, Apartments, Maps, Favorites) {

  $scope.apts = [];

  /* lazy loading */
  var page = 0;
  $scope.morePages = true;
	$scope.loadMore = function() {
    Apartments.getPage(page++).then(function(apts) {
      if (apts.length == 0) {
        $scope.morePages = false;
        return;
      }

      apts.forEach(function(apt) {
        $scope.apts.push(apt);
      });

      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
	};

  /* search */
  $scope.filter = {
    rent: 2000,
    distance: 1000,
    flooring: 'hardwood',
    bed: 2,
    bath: 4
  };

  $scope.search = function() {
    var myPopup = $ionicPopup.show({
      templateUrl: 'templates/list-search.html',
      title: 'Search',
      scope: $scope,
      buttons: [
        {
          text: 'Close'
        },
        {
          text: '<b>Search</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.data.wifi) {
              e.preventDefault();
            } else {
              return $scope.data.wifi;
            }
          }
        }
      ]
    });
  };


  /* Modal Detail */
  AptModal.source.call($scope);

}])

.controller('FavoritesCtrl', ['$scope', 'Favorites',
function($scope, Favorites) {
  Favorites.get().then(function(resp) {
    $scope.apts = resp;
    console.log($scope.apts);
  });
}])

.controller('MapCtrl', ['$scope', 'Apartments', 'Maps',
function($scope, Apartments, Maps) {
  Apartments.getAll().then(function(apts) {
    $scope.apts = apts;

    $scope.map = {
      center: { latitude: 34.0709321, longitude: -118.4447689 }, // bruin plaza
      markers: []
    };

    var i = 0;
    //for (var i in apts) {
      Maps.coords(apts[i].address).then(function(coords) {
        $scope.map.markers.push({
          latitude: coords.latitude,
          longitude: coords.longitude,
          id: i
        });
      });
    //}

  });
}])

;
