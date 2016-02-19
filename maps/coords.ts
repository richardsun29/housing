/// <reference path="node.d.ts" />
import * as https from 'https';
import * as querystring from 'querystring';
import * as fs from 'fs';

interface Apartment {
  id: string;
  address: string;
}

interface Coords {
  latitude: number;
  longitude: number;
}

var contents: Buffer = fs.readFileSync('apartments.json');
var apartments: Apartment[] = JSON.parse(contents.toString());

var endpt: string = 'https://maps.googleapis.com/maps/api/geocode/json';
var options: string = querystring.stringify({
  key: 'AIzaSyCxxHY4QFpofM-K0RoQZVn93dOCm74Vs0o',
  components: 'postal_code:90024', // Westwood
  address: ''
});

var addressToCoords = function(address: string): void {
  https.get(`${endpt}?${options}${address}`, res => {
    var body: string = '';
    res.on('data', chunk => {
      body += chunk;
    });
    res.on('end', () => {
      print_coords(JSON.parse(body));
    });
  }).on('error', e => console.error);
};

var print_coords = function(body): void {
  var res = body.results[0].geometry.location
  var coords: Coords = {
    latitude: res.lat,
    longitude: res.lng
  };
  console.log(coords);
};

addressToCoords('415 Gayley');
