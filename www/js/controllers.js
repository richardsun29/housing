angular.module('starter.controllers', [])

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

.controller('ListCtrl', function($scope, Apartments) {
  Apartments.getMain().then(function(response) {
    $scope.apts = response.filter(function(apt) {
      return apt.monthly_rent_avg != '0.00';
    });
    console.log($scope.apts);
  });
})

.controller('DetailCtrl', function($scope, $stateParams, Apartments) {
  $scope.favorited = true;
  Apartments.getId($stateParams.id).then(function(apt) {
    $scope.apt = apt;
    console.log($scope.apt);
  });
})

.controller('FavoritesCtrl', function($scope, Apartments) {
  Apartments.getFeatured().then(function(resp) {
    $scope.apts = resp;
    console.log($scope.apts);
  });
});
