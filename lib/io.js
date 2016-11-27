const config = require('./config');
const passportSocketIo = require('passport.socketio');
const grpc = require('grpc');
const control = grpc.load(__dirname + '/protos/control.proto').control;
const rpcStub = new control.Control(config.rpcAddr, grpc.credentials.createInsecure());
const queue = require('./queue');
const userEvents = require('./events').userEvents;
const db = require('./db');
const _ = require('lodash');

function init(io, sessionSettings) {

  var sessionFetcher = passportSocketIo.authorize(sessionSettings);
  
  userEvents.on('disconnect', (userId) => {
    const user = db.factory('User');
    user.load(userId, function (err, properties) {

      const socketId = user.p('socketId');
      if (io.sockets.connected[socketId]) {
        io.sockets.connected[socketId].disconnect();
      }

    });
  });

  function onAuthorizeSuccess(socket, data, accept) {

    const user = data.user;

    user.p('socketId', socket.id);
    user.save(() => {
      if (user.p('queueJobId') === 0) {
        queue.addToQueue(user).then(function(addedUser) {
          if (queue.isReadyToPlay(addedUser)) {
            accept(null, true);
          } else {
            socket.disconnect();
            accept(new Error('User is in the queue'), false);
          }
        });
      } else {
        if (queue.isReadyToPlay(user)) {
          accept(null, true);
        } else {
          socket.disconnect();
          accept(new Error('User is in the queue'), false);
        }
      }
    });

  }

  io.use(function(socket, next) {
    const settings = _.clone(sessionSettings);
    settings.success = _.partial(onAuthorizeSuccess, socket);
    passportSocketIo.authorize(settings)(socket, next);
  });


  io.on('connection', function (socket) {

    console.log('A user connected');

    socket.on('handle_key_event', function (payload) {

      if (!payload['key_code']) {
        return;
      }

      rpcStub.handleKeyEvent(payload, function (error, res) { });
    });

    socket.on('handle_image_refresh_event', function (payload) {
      rpcStub.handleImageGetEvent({}, function (error, img) {
        if (!img || error) {
          return;
        }
        socket.emit('return_image', img.image)
        return;
      });
    });

    socket.on('handle_say_text_event', function (payload) {

      if (!payload['text']) {
        return;
      }

      rpcStub.handleSayTextEvent(payload, function (error, res) { });
    });

  });

}

module.exports = init;