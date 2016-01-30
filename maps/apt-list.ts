/// <reference path="node.d.ts" />
import * as http from 'http';
import * as querystring from 'querystring';

var url: string = 'http://dev.bruinmobile.com/housing/getAptData.php';

var req: http.ClientRequest = http.get(url, (res) => {
  res.setEncoding('utf8');

  var body: string = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    parse_apts(body);
  });
});

req.on('error', (e) => {
  console.log(`problem with request: ${e.message}`);
});

req.end();
