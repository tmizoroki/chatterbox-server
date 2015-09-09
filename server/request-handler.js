
var url = require("url");
var path = require("path");
var fs = require("fs");
// The silly objects
var msgCount = 0;
var messagesCollection = {results: [{username: 'Tomio', text: 'I was right all along, suckers!', objectId: 0}]};

var requestHandler = function(request, response) {

  var parsedURL = url.parse(request.url);
  var pathname = parsedURL.pathname;

  // var clientjs = path.join(process.cwd(), '..', 'client', 'scripts', 'app.js');
  // var clienthtml = path.join(process.cwd(), '..', 'client', 'index.html');
  // console.log('HTML: ' + clienthtml);
  // console.log('JS: ' + clientjs);

  // var contentTypesByExtension = {
  //   '.html': 'text/html',
  //   '.css': 'text/css',
  //   '.js': 'text/javascript'
  // }

  // fs.readFile(clienthtml, "binary", function(err, file) {
  //   if (err) {
  //     response.writeHead(500, {"Content-Type": "text/plain"});
  //     response.write(err + '\n');
  //     response.end();
  //     return;
  //   }

  //   var contentType = contentTypesByExtension[path.extname(clienthtml)];
  //   if (contentType) {
  //     headers['Content-Type'] = contentType;
  //   }
  //   response.writeHead(200, headers);
  //   response.write(file, 'binary');
  //   response.end();
  // });

  console.log("Serving request type " + request.method + " for url " + request.url);

  // The outgoing status.
  var statusCode;
  var aggregatedData = '';

  // OPTIONS REQUEST
  if (request.method === 'OPTIONS') {
    if (request.url === pathname || request.url === parsedURL.path) {
      statusCode = 200;
    }
  // POST REQUEST  
  } else if (request.method === 'POST') {
    if (request.url === pathname) {
      statusCode = 201;
    } else {
      statusCode = 404;
    }
    request.on('data', function(data) {
      aggregatedData += data; 
    });
    request.on('end', function() {
      var pendingMessageObject = JSON.parse(aggregatedData);
      pendingMessageObject.createdAt = Date.now();
      pendingMessageObject.objectId = ++msgCount;
      messagesCollection.results.push(pendingMessageObject);
      sortByCreatedAt(messagesCollection.results);
      aggregatedData = '';
    });
  // GET REQUEST
  } else if (request.method === 'GET') {
    if (request.url === '/classes/?order=-createdAt' || request.url === '/classes/room1') {
      statusCode = 200;
    } else {
      statusCode = 404;
    }
  }

  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(messagesCollection));

  var sortByCreatedAt = function (messagesArray) {
    return messagesArray.sort(function(a, b) {
      return b.objectId - a.objectId;
    });
  }
};

var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10,
  'Content-Type': "application/json" // Seconds.
};

module.exports.requestHandler = requestHandler;
