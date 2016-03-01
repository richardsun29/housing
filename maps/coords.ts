/// <reference path="node.d.ts" />
import * as https from 'https';
import * as querystring from 'querystring';
import * as fs from 'fs';

interface Apartment {
  id: string;
  address: string;
}

interface Coords {
  lat: number;
  lng: number;
}

var contents: Buffer = fs.readFileSync('apartments.json');
var apartments: Apartment[] = JSON.parse(contents.toString());

var endpt: string = 'https://maps.googleapis.com/maps/api/geocode/json';
var options: string = querystring.stringify({
  key: 'AIzaSyCxxHY4QFpofM-K0RoQZVn93dOCm74Vs0o',
  components: 'postal_code:90024', // Westwood
  address: ''
});

var addressToCoords = function(apt: Apartment): void {
  https.get(`${endpt}?${options}${apt.address}`, res => {
    var body: string = '';
    res.on('data', chunk => {
      body += chunk;
    });
    res.on('end', () => {
      var coords: Coords = JSON.parse(body).results[0].geometry.location;
      console.log(`${apt.id}\t${coords.lat}\t${coords.lng}`);
    });
  }).on('error', e => console.error);
};

console.log('id\tlatitude\tlongitude\t');

var i: number = 0;
var interval = setInterval(() => {
  if (i >= apartments.length)
    return clearInterval(interval);

  addressToCoords(apartments[i]);
  i++;

}, 1000);
