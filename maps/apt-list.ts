/// <reference path="node.d.ts" />
import * as http from 'http';
import * as querystring from 'querystring';
import * as fs from 'fs';

var url: string = 'http://dev.bruinmobile.com/housing/getAptData.php';

http.get(url, (res) => {
  res.setEncoding('utf8');

  var body: string = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    parse_apts(body);
  });
}).on('error', (e) => {
  console.log(`problem with request: ${e.message}`);
});

interface Apartment {
  id: string;
  address: string;
}

interface HousingResponse {
  main_apt_data: Apartment[];
  featured_apt_data: Apartment[];
}

var parse_apts = function(body: string): void {
  var json: HousingResponse = JSON.parse(body);
  var apartments: Apartment[] = json.main_apt_data;
  apartments = apartments.map(apt => {
    return { id: apt.id, address: apt.address };
  });

  var output: string = JSON.stringify(apartments);
  var file: string = 'apartments.json';
  fs.writeFile(file, output, err => {
    if (err) throw err;
  });
};
