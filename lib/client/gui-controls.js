const input = require('./input');

const keyMap = {
  wKey: 87,
  aKey: 65,
  sKey: 83,
  dKey: 68,
  rKey: 82,
  fKey: 70,
  tKey: 84,
  gKey: 71,
  returnKey: 13
};

const Podium = {};

Podium.keydown = function(k, type) {
  var oEvent = document.createEvent('KeyboardEvent');

  Object.defineProperty(oEvent, 'keyCode', {
    get : function() {
      return this.keyCodeVal;
    }
  });     
  Object.defineProperty(oEvent, 'which', {
    get : function() {
      return this.keyCodeVal;
    }
  });     

  if (oEvent.initKeyboardEvent) {
    oEvent.initKeyboardEvent(type, true, true, document.defaultView, false, false, false, false, k, k);
  } else {
    oEvent.initKeyEvent(type, true, true, document.defaultView, false, false, false, false, k, 0);
  }

  oEvent.keyCodeVal = k;

  if (oEvent.keyCode !== k) {
    alert("keyCode mismatch " + oEvent.keyCode + "(" + oEvent.which + ")");
  }

  if (!input.inCommandMode()) {
    document.dispatchEvent(oEvent);
  }
}

function doClassManipulation (method, className) {
  return function (e) {

    var els = getKeyEl(e)
    if (els) {
      while (els.length) els.pop().classList[method](className)
    }
  }
}

function getKeyEl (e) {

  var char = e.key;

  if (char) {
    var charEl = document.querySelectorAll('.keyboard-key.' + char.toLowerCase());
    if (charEl.length) return [].slice.call(charEl)
  }
}

function addKeyEventsToButton(keyId, keyCode) {
  const wKey = document.getElementById(keyId);
  if (!wKey) {
    return false;
  }

  wKey.onmousedown = () => Podium.keydown(keyCode, 'keydown');
  wKey.touchstart = () => Podium.keydown(keyCode, 'keydown');
  wKey.onmouseup = () => Podium.keydown(keyCode, 'keyup');
  wKey.touchend = () => Podium.keydown(keyCode, 'keyup');
}

function attachEvents() {
  _.forEach(keyMap, (value, key) => addKeyEventsToButton(key, value));
  window.addEventListener('keydown', (e) => {
    if (!input.inCommandMode()) {
      doClassManipulation('add', 'keyboard-keydown')(e);
    }
  });
  window.addEventListener('keyup', (e) => {
    if (!input.inCommandMode()) {
      doClassManipulation('remove', 'keyboard-keydown')(e);
    }
  });
}

function enableGuiControls() {
  if (document.getElementById('controls').style.display !== 'block') {
    document.getElementById('controls').style.display = 'block';
  }
}

function disableGuiControls() {
  document.getElementById('controls').style.display = 'none';
}

attachEvents();

module.exports.enableGuiControls = enableGuiControls;
module.exports.disableGuiControls = disableGuiControls;