angular.module('starter.controllers', [])

.controller('FeaturedCtrl', function() {})

.controller('ListCtrl', function($scope, $state, Apartments) {
  Apartments.get().then(function(response) {
    $scope.apts = response.filter(function(apt) {
      return apt.monthly_rent_avg != '0.00';
    });
    console.log($scope.apts);
  });
})

.controller('DetailCtrl', function($scope, $stateParams, Apartments) {
  Apartments.getId($stateParams.id).then(function(apt) {
    $scope.apt = apt;
    console.log($scope.apt);
  });
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
