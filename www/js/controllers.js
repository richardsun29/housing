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
  Apartments.getMain().then(function(response) {
    $scope.apts = response.filter(function(apt) {
      return apt.monthly_rent_avg != '0.00';
    });
    console.log($scope.apts);
  });

  $scope.filter = {
    rent: 2000,
    distance: 1000,
    flooring: 'hardwood',
    bed: 2,
    bath: 4
  };


  $scope.search = function() {

    // An elaborate, custom popup
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
            //don't allow the user to close unless he enters wifi password
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
