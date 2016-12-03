const setupCozmoStream = require('./viewport').setupCozmoStream;
const updateImage = require('./viewport').updateImage;
const toStatic = require('./viewport').toStatic;
const toStream = require('./viewport').toStream;

let reconnectTimeout;
let socket;
let imageRedrawInterval;
let halt = false;

function connect() {

  socket = io('/', {
      'reconnection': true,
      'reconnectionDelay': 3000,
      'reconnectionDelayMax' : 10000,
      'reconnectionAttempts': Infinity
  });

  socket.on('disconnect', function () {
    toStatic();
    window.clearInterval(imageRedrawInterval);
    if (!halt) {
      reconnectTimeout = setTimeout(() => { connect(); }, 3000 );
    }
  });

  socket.on('connect', function () {
    toStream();
  });

  socket.on('halt', function () {
    halt = true;
  });

  setupCozmoStream(socket);
  imageRedrawInterval = setInterval(() => { updateImage(socket) }, 60);
 
}

connect();

module.exports = socket;
