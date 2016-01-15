angular.module('starter.controllers', [])

.controller('FeaturedCtrl', function($scope, $state, Apartments) {
  Apartments.get().then(function(response) {
    $scope.apts = response.filter(function(apt) {
      return apt.monthly_rent_avg != '0.00';
    });
    console.log($scope.apts);
  });

  $scope.viewDetails = function(id) {
    console.log(Apartments.getId(id));
    $state.go('tab.featured-detail', {id: id});
  };
})

.controller('FeaturedDetailCtrl', function($scope, $stateParams, Apartments) {
  Apartments.getId($stateParams.id).then(function(apt) {
    $scope.apt = apt;
    console.log($scope.apt);
  });
})

.controller('ListCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
