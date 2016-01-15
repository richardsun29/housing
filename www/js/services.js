angular.module('starter.services', [])

.factory('Apartments', function($http, $q) {
  var apt = {};

  var apartments = {};

  var getApts = function() {
    var deferred = $q.defer();
    $http.get('http://dev.bruinmobile.com/housing/getAptData.php').then(function(response) {
      var data = {};
      response.data.main_apt_data.forEach(function(apt) {
        apartments[apt.id] = apt;
      });
      deferred.resolve(response.data.main_apt_data);
    }, function(error) {
      deferred.reject(error);
    });
    return deferred.promise;
  };

  apt.get = function() { return getApts() };
  apt.getId = function(id) {
    var deferred = $q.defer();
    if (Object.keys(apartments).length == 0) {
      getApts().then(function() {
        deferred.resolve(apartments[id]);
      });
    } else {
      deferred.resolve(apartments[id]);
    }
    return deferred.promise;
  };
  return apt;
})

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
