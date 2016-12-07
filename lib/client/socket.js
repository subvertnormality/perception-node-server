const setupCozmoStream = require('./viewport').setupCozmoStream;
const updateImage = require('./viewport').updateImage;
const toStatic = require('./viewport').toStatic;
const toStream = require('./viewport').toStream;
const requestAndUpdateHud = require('./hud').requestAndUpdateHud;

const _ = require('lodash');

let reconnectTimeout;
let imageRedrawInterval;
let halt = false;

const socket = io('/', {
    'reconnection': true,
    'reconnectionDelay': 3000,
    'reconnectionDelayMax' : 10000,
    'reconnectionAttempts': Infinity
});

function connect() {

  requestAndUpdateHud();
  toStatic();

  socket.on('disconnect', function () {

    clearInterval(imageRedrawInterval);
    requestAndUpdateHud();
    toStatic();

    if (!halt) {
      reconnectTimeout = setTimeout(() => { socket.connect(); }, 3000 );
    }
  });

  socket.on('connect', function () {
    imageRedrawInterval = setInterval(() => { updateImage(socket) }, 60);
    requestAndUpdateHud();
    toStream();
  });

  socket.on('halt', function () {
    requestAndUpdateHud();
    toStatic();
    halt = true;
  });

  setupCozmoStream(socket);


  window.addEventListener('resize', _.throttle(() => {
    setupCozmoStream(socket)
  }, 100));

}

connect();

module.exports = socket;
