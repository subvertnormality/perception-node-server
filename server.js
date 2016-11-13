
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var grpc = require('grpc');
var control = grpc.load(__dirname + '/protos/control.proto').control;
var rpcStub = new control.Control('localhost:50051', grpc.credentials.createInsecure());

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/currentCozmoImage', function (req, res) {

    rpcStub.handleImageGetEvent({}, function(error, img) {
        console.log(img)
        res.end(img.image, 'binary');
    });

});

http.listen(3000, function () {
  console.log('Listening on port 3000')
});

io.on('connection', function(socket){

  console.log('a user connected');

  socket.on('handle_key_event', function(payload){

    if (!payload['key_code']) {
        return;
    }

    rpcStub.handleKeyEvent(payload, function(error, res) {});
  });

  socket.on('handle_image_refresh_event', function(payload){
    rpcStub.handleImageGetEvent({}, function(error, img) {
        if (!img || error) {
            return;
        }
        socket.emit('return_image', img.image)
        return;
    });
  });

  socket.on('handle_say_text_event', function(payload){

    if (!payload['text']) {
        return;
    }

    rpcStub.handleSayTextEvent(payload, function(error, res) {});
  });

});