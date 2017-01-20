const input = require('./input');
const Hammer = require('hammerjs')
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

const joystickThreshold = 0.2;

const joystickOptions = {
    zone: document.getElementById('controls'),
    color: '#0fc127',
    size: 100,
    threshold: joystickThreshold,
    mode: 'dynamic',
    restOpacity:  0.5
};

const joystickManager = require('nipplejs').create(joystickOptions);

const hammerEvents = [];
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
  wKey.onmouseup = () => Podium.keydown(keyCode, 'keyup');

  const mc = new Hammer.Manager(wKey);
  mc.add(new Hammer.Press());
  mc.on('press', (ev) => Podium.keydown(keyCode, 'keydown'));
  mc.on('pressup', (ev) => Podium.keydown(keyCode, 'keyup'));
  hammerEvents.push(mc);
}

function keyupOppositeJoystickDirections(directionX, directionY) {
  if (directionX == 'right') {
    Podium.keydown(keyMap.aKey, 'keyup');
  }
  if (directionX == 'left') {
    Podium.keydown(keyMap.dKey, 'keyup');
  }
  if (directionY == 'up') {
    Podium.keydown(keyMap.sKey, 'keyup');
  }
  if (directionY == 'down') {
    Podium.keydown(keyMap.wKey, 'keyup');
  }
}

function keyupAllJoystickDirections() {
  Podium.keydown(keyMap.wKey, 'keyup');
  Podium.keydown(keyMap.aKey, 'keyup');
  Podium.keydown(keyMap.sKey, 'keyup');
  Podium.keydown(keyMap.dKey, 'keyup');
}

function attachEvents() {
  _.drop(hammerEvents, hammerEvents.length);
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
  joystickManager.on('added', function (evt, nipple) {
      nipple.on('plain:up', function (evt) {
          Podium.keydown(keyMap.wKey, 'keydown');
      });
      nipple.on('plain:down', function (evt) {
          Podium.keydown(keyMap.sKey, 'keydown');
      });
      nipple.on('plain:left', function (evt) {
          Podium.keydown(keyMap.aKey, 'keydown');
      });
      nipple.on('plain:right', function (evt) {
          Podium.keydown(keyMap.dKey, 'keydown');
      });
      nipple.on('move', function (evt) {

        const rAngle = evt.angle.radian;
        const angle45 = Math.PI / 4;
        const angle90 = Math.PI / 2;
        const directionX, directionY;

        if (rAngle > -angle90 && rAngle < angle90) {
            directionX = 'left';
        } else {
            directionX = 'right';
        }

        if (rAngle > 0) {
            directionY = 'up';
        } else {
            directionY = 'down';
        }

        keyupOppositeJoystickDirections(directionX, directionY);

        if (evt.force < joystickThreshold) {
          keyupAllJoystickDirections();
        }

      });
  }).on('removed', function (evt, nipple) {
      nipple.off('start move end dir plain');
  });
}



function enableGuiControls() {
  if (document.getElementById('controls').style.display !== 'block') {
    if (Modernizr.touchevents) {
      document.getElementById('joystickLeft').style.display = 'block';
    }
    document.getElementById('controls').style.display = 'block';
  }
}

function disableGuiControls() {
  document.getElementById('joystickLeft').style.display = 'none';
  document.getElementById('controls').style.display = 'none';
}

attachEvents();

module.exports.enableGuiControls = enableGuiControls;
module.exports.disableGuiControls = disableGuiControls;