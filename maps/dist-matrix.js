var http = require('http');
var querystring = require('querystring');

var api_key = 'AIzaSyD6XhAXWqX9WI49xvmY-YY1pMaKRI2qKB0';
var endpoint = 'https://maps.googleapis.com/maps/api/distancematrix/json';

var destinations = 'Dickson Court South, Los Angeles, CA 90095'; // flagpole

var options = querystring.stringify({
  origins: '',
  destinations: destinations,
  key: api_key,
  mode: 'walking',
  units: 'imperial'
});
console.log(options);
