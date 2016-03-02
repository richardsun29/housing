angular.module('controllers', ['uiGmapgoogle-maps'])

.controller('TabsCtrl', ['$state', '$scope', 'AptModal',
function($state, $scope, AptModal) {
  $scope.goto = function(state, params) {
    $state.go(state, params);
  };

  /* Modal Detail */
  AptModal.source.call($scope);
}])

.controller('FeaturedCtrl', ['$scope', 'Apartments',
function($scope, Apartments) {
  Apartments.getFeatured().then(function(response) {
    $scope.apts = response;
    console.log($scope.apts);
  });
}])

.controller('ListCtrl', ['$scope', 'Apartments', 'Search',
function($scope, Apartments, Search) {

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
  $scope.ranges = Search.ranges;
  $scope.filter = {};
  $scope.search = Search.show($scope);
  $scope.search();
}])

.controller('FavoritesCtrl', ['$scope', 'Favorites', 'Search',
function($scope, Favorites, Search) {
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
