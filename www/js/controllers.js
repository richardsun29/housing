angular.module('controllers', ['uiGmapgoogle-maps'])

.controller('TabsCtrl', function($state, $scope) {
  $scope.goto = function(state, params) {
    $state.go(state, params);
  };
})

.controller('FeaturedCtrl', function($scope, Apartments) {
  Apartments.getFeatured().then(function(response) {
    $scope.apts = response;
    console.log($scope.apts);
  });
})

.controller('ListCtrl', function($scope, $ionicPopup, Apartments) {

  $scope.apts = [];
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

})

.controller('DetailCtrl', function($scope, $stateParams, Apartments,
      Favorites, Maps) {

  var id = $stateParams.id;

  $scope.favorited = Favorites.isFavorited(id);

  $scope.toggleFavorite = function() {
    $scope.favorited = Favorites.toggle(id);
  }

  Apartments.getId(id).then(function(apt) {
    $scope.apt = apt;

    $scope.mapsUrl = Maps.url(apt.address);

    Maps.coords(apt.address).then(function(coords) {
      var markers = [{
        latitude: coords.latitude,
        longitude: coords.longitude,
        id: 0
      }];
      $scope.map = {
        center: coords,
        markers: markers
      };
    });

    console.log($scope.apt);
  });
})

.controller('FavoritesCtrl', function($scope, Favorites) {
  Favorites.get().then(function(resp) {
    $scope.apts = resp;
    console.log($scope.apts);
  });
});
