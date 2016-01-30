/// <reference path="node.d.ts" />
import * as https from 'https';
import * as querystring from 'querystring';
import * as fs from 'fs';

interface Apartment {
  id: string;
  address: string;
}

var contents: Buffer = fs.readFileSync('apartments.json');
var apartments: Apartment[] = JSON.parse(contents.toString());

// append city name
var la: string = 'Los Angeles';
apartments = apartments.map(apt => {
  return { id: apt.id, address: `${apt.address} ${la}` };
});


console.log(apartments.length);

console.log('id\tdistance(m)\ttime(s)');


var api_key: string = 'AIzaSyD6XhAXWqX9WI49xvmY-YY1pMaKRI2qKB0';
var endpt: string = 'https://maps.googleapis.com/maps/api/distancematrix/json';

// flagpole
var destinations: string = 'Dickson Court South, Los Angeles, CA 90095';

var index: number = 0;
var nth_request = 0;

while (index < apartments.length) {
  // URL length is restricted to ~2000 characters, after encoding
  var origins: string = '';
  while (index < apartments.length && origins.length < 1000) {
    origins += apartments[index].address + '|';
    index++;
  }

  var options: string = querystring.stringify({
    origins: origins,
    destinations: destinations,
    key: api_key,
    mode: 'walking',
  });


  setTimeout(() => {
    https.get(`${endpt}?${options}`, res => {
      var body: string = '';
      res.on('data', chunk => {
        body += chunk;
      });
      res.on('end', () => {
        print_distance(body);
      });
    }).on('error', e => console.error);
  }, nth_request++ * 1000);
}


var total_index = 0;
var print_distance = function(body: string): void {
  var rows: any[] = JSON.parse(body).rows;

  for (let i = 0; i < rows.length; i++) {
    var id: string = apartments[total_index].id;
    var distance: number = rows[i].elements[0].distance.value;
    var duration: number = rows[i].elements[0].duration.value;
    console.log(`${id}\t${distance}\t${duration}`);
    total_index++;
  }
};
