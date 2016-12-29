function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

(function processQueryString() {
  var one = getParameterByName('one');
  var two = getParameterByName('two');
  var three = getParameterByName('three');
  var four = getParameterByName('four');
  var five = getParameterByName('five');
  var six = getParameterByName('six');

  if (one) {
    var ele = document.getElementById('one');
    ele.className += ' ' + one;
  }
  if (two) {
    var ele = document.getElementById('two');
    ele.className += ' ' + two;
  }
  if (three) {
    var ele = document.getElementById('three');
    ele.className += ' ' + three;
  }
  if (four) {
    var ele = document.getElementById('four');
    ele.className += ' ' + four;
  }
  if (five) {
    var ele = document.getElementById('five');
    ele.className += ' ' + five;
  }
  if (six) {
    var ele = document.getElementById('six');
    ele.className += ' ' + six;
  }
})();


var stat = document.getElementById('static');
if (stat) {
  var ctx = stat.getContext('2d');

  function noise() {
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
  }

  intervalLoop = setInterval(function () { noise(ctx) }, 100);
  stat.style.backgroundColor = '#fff';


  const resize = function resize() {

    stat.style.width = window.innerWidth + 'px';
    stat.style.height = window.innerHeight + 'px';

  };

  resize();

  window.addEventListener('resize', resize);

  (function() {

    var imageOne = document.getElementById('imageOne');
    var imageTwo = document.getElementById('imageTwo');
    var imageThree = document.getElementById('imageThree');


    document.getElementById('imageOne').style.display = 'block';

    function isHidden(el) {
        var style = window.getComputedStyle(el);
        return (style.display === 'none')
    }

    function revealImage() {
      
      if (imageOne.style.display === 'block') {
        imageOne.style.display = 'none';
        imageTwo.style.display = 'block';
      } else if (imageTwo.style.display === 'block') {
        imageTwo.style.display = 'none';
        imageThree.style.display = 'block';
      } else if (imageThree.style.display === 'block') {
        imageThree.style.display = 'none';
        imageOne.style.display = 'block';
      }

    }

    setInterval(revealImage, 5000);

  })();
}
const socket = io.connect('/gameUi', {
    reconnection: true,
    reconnectionDelay: 3000,
    reconnectionDelayMax : 10000,
    reconnectionAttempts: Infinity,
    transports: ['websocket']
});

socket.on('reload', function () {
  window.location.reload(true);
});