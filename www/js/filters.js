angular.module('filters', [])

.filter('rent', function() {
  return function(input) {
    var num = parseFloat(input);
    if (isNaN(num) || num == 0)
      return 'Unavailable';
    else
      return '$' + input;
  };
})

.filter('distance', function() {
  return function(input) {
    var miles = parseFloat(input);
    if (isNaN(miles) || miles == 0)
      return 'Unavailable';
    else
      return miles.toFixed(2) + ' mi.';
  };
})

.filter('contact', function() {
  return function(input) {
    return input || 'Unavailable';
  }
})

// At most 2 decimal places
.filter('rangeFilter', function() {
  var round = function(x) {
    return (Math.round(x * 100) / 100).toString();
  };

  return function(input) {
    return round(input.from) + ' - ' + round(input.to);
  };
})

;
