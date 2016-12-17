const viewport = require('./viewport');
const twitchStream = require('./twitch-stream');
const hud = require('./hud');

const _ = require('lodash');

const stream = document.getElementById('cozmoStream');

let reconnectTimeout;
let imageRedrawInterval;
let halt = false;

const socket = io.connect('/', {
    reconnection: true,
    reconnectionDelay: 3000,
    reconnectionDelayMax : 10000,
    reconnectionAttempts: Infinity,
    transports: ['websocket']
});

function connect() {

  twitchStream.start();
  hud.requestAndUpdate();

  socket.on('disconnect', function () {

    viewport.toStatic();
    clearInterval(imageRedrawInterval);
    hud.requestAndUpdate();
    twitchStream.start();

    if (!halt) {
      reconnectTimeout = setTimeout(() => { socket.connect(); }, 3000 );
    }
  });

  socket.on('connect', function () {
    imageRedrawInterval = setInterval(() => { viewport.updateImage(socket) }, 140);
    hud.requestAndUpdate();
    viewport.toStream();
    twitchStream.stop();
  });

  socket.on('halt', function () {
    viewport.toStatic();    
    hud.requestAndUpdate();
    halt = true;
    twitchStream.stop();
  });

  viewport.setupCozmoStream(socket);


  window.addEventListener('resize', _.throttle(() => {
    viewport.setupCozmoStream(socket)
  }, 100));

}

viewport.toStatic();

if (stream) {
  connect();
}

module.exports = socket;
