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

const joystickThreshold = 0.3;

const hammerEvents = [];
const Podium = {};

let joystickManager;

Podium.keydown = function(k, type) {
  const oEvent = document.createEvent('KeyboardEvent');

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
    if (directionY == 'up') {
      Podium.keydown(keyMap.aKey, 'keyup');
      Podium.keydown(keyMap.sKey, 'keyup');
    } else if (directionY == 'down') {
      Podium.keydown(keyMap.aKey, 'keyup');
      Podium.keydown(keyMap.wKey, 'keyup');
    } else {
      Podium.keydown(keyMap.aKey, 'keyup');
      Podium.keydown(keyMap.sKey, 'keyup');
      Podium.keydown(keyMap.wKey, 'keyup');
    }
  }
  if (directionX == 'left') {
    if (directionY == 'up') {
      Podium.keydown(keyMap.dKey, 'keyup');
      Podium.keydown(keyMap.sKey, 'keyup');
    } else if (directionY == 'down') {
      Podium.keydown(keyMap.dKey, 'keyup');
      Podium.keydown(keyMap.wKey, 'keyup');
    } else {
      Podium.keydown(keyMap.dKey, 'keyup');
      Podium.keydown(keyMap.sKey, 'keyup');
      Podium.keydown(keyMap.wKey, 'keyup');
    }
  }
  if (directionY == 'up') {
    Podium.keydown(keyMap.aKey, 'keyup');
    Podium.keydown(keyMap.sKey, 'keyup');
    Podium.keydown(keyMap.dKey, 'keyup');
  }
  if (directionY == 'down') {
    Podium.keydown(keyMap.aKey, 'keyup');
    Podium.keydown(keyMap.wKey, 'keyup');
    Podium.keydown(keyMap.dKey, 'keyup');
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

  const joystickOptions = {
      zone: document.getElementById('joystickLeft'),
      color: '#026F00',
      size: 120,
      threshold: joystickThreshold,
      mode: 'semi',
      restOpacity:  1,
  };

  joystickManager = require('nipplejs').create(joystickOptions);

  joystickManager.on('added', function (evt, nipple) {
      nipple.on('move', function (evt, data) {
        const rAngle = data.angle.radian;
        const angle45 = Math.PI / 4;
        const angle90 = Math.PI / 2;
        let directionX;
        let directionY;

        if (data.force > joystickThreshold) {
          // up
          if (data.angle.degree <= 120 && data.angle.degree >= 60) {
            Podium.keydown(keyMap.wKey, 'keydown');
            directionY = 'up';
            directionX = '';
          }

          // up left
          if (data.angle.degree <= 150 && data.angle.degree > 120) {
            Podium.keydown(keyMap.wKey, 'keydown');
            Podium.keydown(keyMap.aKey, 'keydown');
            directionY = 'up';
            directionX = 'left';
          }

          // up right
          if (data.angle.degree < 60 && data.angle.degree > 30) {
            Podium.keydown(keyMap.wKey, 'keydown');
            Podium.keydown(keyMap.dKey, 'keydown');
            directionY = 'up';
            directionX = 'right';
          }

          // left
          if (data.angle.degree >= 150 && data.angle.degree <= 210) {
            Podium.keydown(keyMap.aKey, 'keydown');
            directionY = '';
            directionX = 'left';
          }
        
          // right
          if (data.angle.degree >= 330 || data.angle.degree <= 30) {
            Podium.keydown(keyMap.dKey, 'keydown');
            directionY = '';
            directionX = 'right';
          }

          // down
          if (data.angle.degree <= 300 && data.angle.degree >= 240) {
            Podium.keydown(keyMap.sKey, 'keydown');
            directionY = 'down';
            directionX = '';
          }

          // down left
          if (data.angle.degree < 240 && data.angle.degree > 210) {
            Podium.keydown(keyMap.aKey, 'keydown');
            Podium.keydown(keyMap.sKey, 'keydown');
            directionY = 'down';
            directionX = 'left';
          }

          // down right
          if (data.angle.degree < 330 && data.angle.degree > 300) {
            Podium.keydown(keyMap.dKey, 'keydown');
            Podium.keydown(keyMap.sKey, 'keydown');
            directionY = 'down';
            directionX = 'right';
          }
        }

        keyupOppositeJoystickDirections(directionX, directionY);

        if (data.force < joystickThreshold) {
          keyupAllJoystickDirections();
        }

      });
  }).on('removed', function (evt, nipple) {
    keyupAllJoystickDirections();
    nipple.off('start move end dir plain');
  }).on('end', function (evt, nipple) {
    keyupAllJoystickDirections();
  });
}



function enableGuiControls() {
  if (document.getElementById('controls').style.display !== 'block') {
    document.getElementById('joystickLeft').style.display = 'block';
    document.getElementById('controls').style.display = 'block';
  }
}

function disableGuiControls() {
  document.getElementById('joystickLeft').style.display = 'none';
  document.getElementById('controls').style.display = 'none';
}

if (document.getElementById('controls')) {
  attachEvents();
}

module.exports.enableGuiControls = enableGuiControls;
module.exports.disableGuiControls = disableGuiControls;