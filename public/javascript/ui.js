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
