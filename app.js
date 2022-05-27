const express = require('express');
const http = require('http');

var app = express();

const server = require('http').createServer(app);

var port = process.env.PORT || 3000;

app.use(express.static('public'));

server.listen(port, function () {
   console.log(`florist project running at ${port}`);
});
