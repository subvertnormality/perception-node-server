const config = require('./config');
const passportSocketIo = require('passport.socketio');
const grpc = require('grpc');
const control = grpc.load(__dirname + '/protos/control.proto').control;
const queue = require('./queue');
const userEvents = require('./events').userEvents;
const db = require('./db');
const _ = require('lodash');
const game = require('./game');

const sslCreds = grpc.credentials.createSsl(
  config.publicCert, 
  config.clientKey, 
  config.clientCert
);

const dns = require('dns');

const rpcStub = new control.Control(config.rpcAddr, sslCreds);
// const rpcStub = new control.Control(config.rpcAddr, grpc.credentials.createInsecure());
let connectedUserLastEventTime;
let connectedUserActivityCheck;

function init(io, sessionSettings) {
  const settings = sessionSettings;
  const userSocket = io.of('/play');
  game.startNewRound(() => {});

  userEvents.on('disconnect', (userId) => {
    const user = db.factory('User');
    user.load(userId, function (err, properties) {
      
      const socketId = user.p('socketId');
      if (userSocket.connected[socketId]) {
        userSocket.connected[socketId].disconnect();
        rpcStub.handleResetEvent({}, function (error, img) {});
      }
    });
  });

  function onAuthorizeSuccess(socket, data, accept) {
    const userSocket = io.of('/play');
    const user = data.user;
    const existingSocketId = user.p('socketId');
    if (existingSocketId && userSocket.connected[existingSocketId]) {
      userSocket.connected[existingSocketId].emit('halt')
      userSocket.connected[existingSocketId].disconnect();
      rpcStub.handleResetEvent({}, function (error, img) {});
    }

    user.p('socketId', socket.id);
    user.save(() => {
      if (user.p('queueJobId') === 0) {
        queue.addToQueue(user).then((err, addedUser, job) => {

          if (queue.isReadyToPlay(user)) {
            accept(null, true);
          } else if (err) {
            accept(err);
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

  userSocket.use(function(socket, next) {
    settings.success = _.partial(onAuthorizeSuccess, socket);
    passportSocketIo.authorize(settings)(socket, next);
  });

  userSocket.on('connection', function (socket) {
    connectedUserLastEventTime = Math.floor(Date.now() / 1000);

    connectedUserActivityCheck = setInterval(function activityCheck() {

      if (connectedUserLastEventTime && Math.floor(Date.now() / 1000) - connectedUserLastEventTime > config.userInactivityTime) {
        clearInterval(connectedUserActivityCheck);        
        queue.endCurrentTurn();
      }

    }, 10000);

    function registerEventTime() {
      connectedUserLastEventTime = Math.floor(Date.now() / 1000);
    }

    socket.emit('connect_success')

    socket.on('handle_key_event', function (payload) {
      if (!payload['key_code']) {
        return;
      }

      rpcStub.handleKeyEvent(payload, function (error, res) { });
      registerEventTime();
    });

    socket.on('handle_image_refresh_event', function (payload) {
      rpcStub.handleImageGetEvent({}, function (error, img) {
        if (!img || error) {
          return;
        }
        socket.emit('return_image', img.image);
        return;
      });
    });

    socket.on('handle_say_text_event', function (payload) {

      if (!payload['text']) {
        return;
      }

      payload['text'] = payload['text'].replace(/[^\w\s!?]/g,'');

      rpcStub.handleSayTextEvent(payload, function (error, res) { 
        if (error) {
          console.log('error')
          return;
        } else {
          console.log('emiting')
          socket.emit('text_response', {
            said: payload['text'],
            reply: res.message
          });
        }

      });
      registerEventTime();
    });

  });

}

module.exports = init;