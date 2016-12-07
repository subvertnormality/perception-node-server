const cozmoStream = document.getElementById('cozmoStream');
const staticStream = document.getElementById('static');
const startStatic = require('./static').startStatic;
const stopStatic = require('./static').stopStatic;
const staticIsActive = require('./static').isActive;
const _ = require('lodash');

function updateImage(socket) {
  socket.emit(
    'handle_image_refresh_event',
    {}
  );
}

function encode(input) {
  var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var output = "";
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  var i = 0;

  while (i < input.length) {
    chr1 = input[i++];
    chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
    chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
      keyStr.charAt(enc3) + keyStr.charAt(enc4);
  }
  return output;
}

function setupCozmoStream(socket) {

  if (!cozmoStream) {
    return false;
  }

  const toStreamThrottled = _.throttle(toStream, 1000);
  let lastBytes;

  if (!staticIsActive) {
    if (!isActive()) {
      toStatic();
    }
    return false;
  }

  cozmoStream.width = window.innerWidth;
  cozmoStream.height = window.innerHeight

  var stream = cozmoStream.getContext('2d');

  var img = new Image();

  img.onload = function () {
    stream.drawImage(this, 0, 0, cozmoStream.width, cozmoStream.height);
  }

  socket.on('return_image', function (image) {
    var bytes = new Uint8Array(image);
    img.src = 'data:image/png;base64,' + encode(bytes);

    if (lastBytes !== bytes) {
      toStreamThrottled();
    }

    lastBytes = bytes;
  });
}

function toStatic() {
  if (cozmoStream) {
    cozmoStream.style.display = 'none';  
  }
  staticStream.style.display = 'block';
  startStatic();
}

function toStream() {
  if (cozmoStream) {
    cozmoStream.style.display = 'block';
  }
  staticStream.style.display = 'none';
  stopStatic();
}



module.exports.setupCozmoStream = setupCozmoStream;
module.exports.updateImage = updateImage;
module.exports.toStatic = toStatic;
module.exports.toStream = toStream;