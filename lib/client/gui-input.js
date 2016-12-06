let Podium = {};
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

  document.dispatchEvent(oEvent);
}

function addKeyEventsToKey(keyId, keyCode) {
  const wKey = document.getElementById(keyId);
  wKey.onmousedown = () => Podium.keydown(keyCode, 'keydown');
  wKey.touchstart = () => Podium.keydown(keyCode, 'keydown');
  wKey.onmouseup = () => Podium.keydown(keyCode, 'keyup');
  wKey.touchend = () => Podium.keydown(keyCode, 'keyup');
}

function attachEvents() {
  addKeyEventsToKey('wKey', 87);
  addKeyEventsToKey('aKey', 65);
  addKeyEventsToKey('sKey', 83);
  addKeyEventsToKey('dKey', 68);
  addKeyEventsToKey('rKey', 82);
  addKeyEventsToKey('fKey', 70);
  addKeyEventsToKey('tKey', 84);
  addKeyEventsToKey('gKey', 71);
  addKeyEventsToKey('returnKey', 13);
}

module.exports = attachEvents;
