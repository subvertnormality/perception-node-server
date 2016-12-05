const stat = document.getElementById('static');
const ctx = stat.getContext('2d');
const _ = require('lodash');

let intervalLoop;

stat.width = stat.height = 256;

const resize = _.throttle(function resize() {

  stat.style.width = window.innerWidth + 'px';
  stat.style.height = window.innerHeight + 'px';

}, 100);

resize();

window.addEventListener('resize', resize);

const noise = _.throttle(function noise(ctx) {

  var w = ctx.canvas.width,
    h = ctx.canvas.height,
    idata = ctx.createImageData(w, h),
    buffer32 = new Uint32Array(idata.data.buffer),
    len = buffer32.length,
    run = 0,
    color = 0,
    m = Math.random() * 6 + 4,
    band = Math.random() * 256 * 256,
    p = 0,
    i = 0;

  for (; i < len;) {
    if (run < 0) {
      run = m * Math.random();
      p = Math.pow(Math.random(), 0.4);
      if (i > band && i < band + 48 * 256) {
        p = Math.random();
      }
      color = (255 * p) << 24;
    }
    run -= 1;
    buffer32[i++] = color;
  }

  ctx.putImageData(idata, 0, 0);
}, 100);

function startStatic() {
  intervalLoop = setInterval(() => { noise(ctx) }, 100);
}

function stopStatic() {
  clearInterval(intervalLoop);
}

function isActive() {
  return intervalLoop ? true : false;
}


module.exports.startStatic = startStatic;
module.exports.stopStatic = stopStatic;
module.exports.isActive = isActive;