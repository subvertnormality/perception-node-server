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

var socket = io.connect(addr + 'gameUi', {
    reconnection: true,
    reconnectionDelay: 3000,
    reconnectionDelayMax : 10000,
    reconnectionAttempts: Infinity,
    transports: ['websocket'],
    query: 'sechash=' + sechash
});

socket.on('reload', function () {
  window.location.reload(true);
});