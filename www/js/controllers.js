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

.controller('ListCtrl', ['$scope', '$q', 'Apartments', 'Search',
function($scope, $q, Apartments, Search) {

  $scope.apts = [];

  /* lazy loading */
  var allApts = [];
  var deferred = $q.defer();
  var loaded = deferred.promise;

  Apartments.getAll().then(function(apts) {
    allApts = apts;
    deferred.resolve();
    console.log('resolved');
  });

  var page = 1;
  var perPage = 10;
  $scope.morePages = true;

  $scope.loadMore = function() {
    loaded.then(function() {
      var start = page * perPage;
      if (start > allApts.length) {
        $scope.morePages = false;
        return;
      }
      var slice = allApts.slice(start, start + perPage);
      $scope.apts = $scope.apts.concat(slice);
      $scope.$broadcast('scroll.infiniteScrollComplete');
      page++;
    });
  };

  /* search */
  $scope.ranges = Search.ranges;
  $scope.filter = {};
  $scope.search = Search.show($scope);
  //$scope.search();
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
