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

.controller('ListCtrl', ['$scope', '$ionicPopup', 'Apartments',
    'Maps', 'Favorites',
function($scope, $ionicPopup, Apartments, Maps, Favorites) {

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

  $scope.ranges = {};
  $scope.ranges.rent =  [
    {
      text: 'No preference',
      min: -1,
      max: -1
    },
    {
      text: '< $1000',
      min: -1,
      max: 1000
    },
    {
      text: '$1000 - $2000',
      min: 1000,
      max: 2000
    },
    {
      text: '$2000 - $3000',
      min: 2000,
      max: 3000
    },
    {
      text: '> $3000',
      min: 3000,
      max: -1
    }
  ];
  $scope.ranges.distance = [
    {
      text: 'No preference',
      min: -1,
      max: -1
    },
    {
      text: '< 0.5 mi',
      min: -1,
      max: 0.5
    },
    {
      text: '0.5 - 1.0 mi',
      min: 0.5,
      max: 1.0
    },
    {
      text: '1.0 - 2.0 mi',
      min: 1,
      max: 2
    },
    {
      text: '> 2.0 mi',
      min: 2,
      max: -1
    }
  ];

  /* search */
  $scope.filter = {
    rent: $scope.ranges.rent[0],
    distance: $scope.ranges.distance[0],
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
            console.log($scope.filter);
          }
        }
      ]
    });
  };
  $scope.search();
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
