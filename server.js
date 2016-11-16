const express = require('express');
const app = express();
const http = require('http').Server(app);
const grpc = require('grpc');
const control = grpc.load(__dirname + '/protos/control.proto').control;
const rpcStub = new control.Control('1.tcp.eu.ngrok.io:20187', grpc.credentials.createInsecure());
const initIo = require('./lib/io');

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/currentCozmoImage', function (req, res) {

    rpcStub.handleImageGetEvent({}, function(error, img) {
        res.end(img.image, 'binary');
    });

});

app.use(express.static('public'))

initIo(rpcStub, http);

http.listen(3000, function () {
  console.log('Listening on port 3000')
});
