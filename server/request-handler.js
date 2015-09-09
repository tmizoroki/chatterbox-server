
var parseURL = require("url");
// The silly objects
var msgCount = 0;
var messagesCollection = {results: [{username: 'Tomio', text: 'I was right all along, suckers!', objectId: 0}]};

var requestHandler = function(request, response) {

  var parsedurl = parseURL.parse(request.url);
  console.log(parsedurl);

  var pathname = parsedurl.pathname;

  console.log("Serving request type " + request.method + " for url " + request.url);
  console.log("request url is ", request.url);




  // The outgoing status.
  var statusCode;
  var aggregatedData = '';

  // OPTIONS REQUEST
  if (request.method === 'OPTIONS') {
    if (request.url === pathname || request.url === parsedurl.path) {
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



  // headers['Content-Type'] = "application/json";
  // console.log('status code: ' + statusCode);
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(messagesCollection));

  var sortByCreatedAt = function (messagesArray) {
    return messagesArray.sort(function(a, b) {
      return b.objectId - a.objectId;
    });
  }

};


  // See the note below about CORS headers.

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.


// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10,
  'Content-Type': "application/json" // Seconds.
};

module.exports.requestHandler = requestHandler;
