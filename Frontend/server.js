'use strict';
var http = require('http');
var fs = require('fs');
var url = require('url');
var port = process.env.PORT || 1337;
/*
http.createServer(function (req, res) {
    // Parse the request containing file name
    var pathname = url.parse(request.url).pathname;

    // Print the name of the file for which request is made.
    console.log("Request for " + pathname + " received.");

    // Read the requested file content from file system
    fs.readFile(pathname.substr(1), function (err, data) {
        if (err) {
            console.log(err);
            // HTTP Status: 404 : NOT FOUND
            // Content Type: text/plain
            response.writeHead(404, { 'Content-Type': 'text/html' });
        } else {
            //Page found	  
            // HTTP Status: 200 : OK
            // Content Type: text/plain
            response.writeHead(200, { 'Content-Type': 'text/html' });

            // Write the content of the file to response body
            response.write(data.toString());
        }
        // Send the response body 
        response.end();
    });   
}).listen(8080);
*/


function send404response(response)
{
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.write("Error 404: Page isnt here");
    response.end();
}

function onRequest(request, response) {
    if (request.method === 'GET' && request.url === '/')
    {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream("./Page1.html").pipe()(response);
    } else {
        send404response(response);
    }

}
console.log('Server Running!');
