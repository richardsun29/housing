angular.module('starter', ['ionic', 'controllers', 'services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'TabsCtrl'
  })

  // Each tab has its own nav history stack:

  .state('tab.featured', {
    url: '/featured',
    views: {
      'tab-featured': {
        templateUrl: 'templates/featured.html',
        controller: 'FeaturedCtrl'
      }
    }
  })
  .state('tab.featured-detail', {
    url: '/apartments/featured/:id',
    views: {
      'tab-featured': {
        templateUrl: 'templates/detail.html',
        controller: 'DetailCtrl'
      }
    }
  })

  .state('tab.list', {
      url: '/list',
      views: {
        'tab-list': {
          templateUrl: 'templates/list.html',
          controller: 'ListCtrl'
        }
      }
    })
    .state('tab.list-detail', {
      url: '/apartments/list/:id',
      views: {
        'tab-list': {
          templateUrl: 'templates/detail.html',
          controller: 'DetailCtrl'
        }
      }
    })

  .state('tab.favorites', {
    url: '/favorites',
    views: {
      'tab-favorites': {
        templateUrl: 'templates/favorites.html',
        controller: 'FavoritesCtrl'
      }
    }
  })
  .state('tab.favorites-detail', {
    url: '/apartments/favorites/:id',
    views: {
      'tab-favorites': {
        templateUrl: 'templates/detail.html',
        controller: 'DetailCtrl'
      }
    }
  })

  .state('tab.map', {
    url: '/map',
    views: {
      'tab-map': {
        templateUrl: 'templates/full-map.html',
        controller: 'MapCtrl'
      }
    }
  })

  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/featured');

})

.directive('listSearch', function() {
  return {
    restrict: 'E',
    scope: {
      filter: '=filter'
    },
    templateUrl: 'templates/list-search.html'
  };
})

;
