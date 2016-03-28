angular.module('controllers', ['uiGmapgoogle-maps', 'ngRangeSlider'])

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

  Apartments.getAll().then(function(apts) {
    $scope.apts = apts;
    $scope.loadMore();
  });

  /* lazy loading */
  $scope.morePages = true;

  $scope.aptLimit = 0; // number of apartments shown in list
  var perPage = 10;
  $scope.loadMore = function() {
    $scope.aptLimit += perPage;
    if ($scope.aptLimit >= $scope.apts.length)
      $scope.morePages = false;
    $scope.$broadcast('scroll.infiniteScrollComplete');
  };

  /* search */
  $scope.ranges = Search.ranges;
  $scope.filter = {};
  $scope.search = Search.show($scope);
  $scope.search();
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
