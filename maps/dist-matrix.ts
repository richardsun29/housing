/// <reference path="node.d.ts" />
import * as http from 'http';
import * as querystring from 'querystring';
import * as fs from 'fs';

interface Apartment {
  id: string;
  address: string;
}

var contents: Buffer = fs.readFileSync('apartments.json');
var apartments: Apartment[] = JSON.parse(contents.toString());

var api_key: string = 'AIzaSyD6XhAXWqX9WI49xvmY-YY1pMaKRI2qKB0';
var endpt: string = 'https://maps.googleapis.com/maps/api/distancematrix/json';

// flagpole
var destinations: string = 'Dickson Court South, Los Angeles, CA 90095';

var options: string = querystring.stringify({
  origins: '',
  destinations: destinations,
  key: api_key,
  mode: 'walking',
  units: 'imperial'
});
