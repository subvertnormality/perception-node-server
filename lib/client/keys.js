window.addEventListener('keydown', classy('add', 'keyboard-keydown'))
window.addEventListener('keyup', classy('remove', 'keyboard-keydown'))

function classy (method, className) {
  return function (e) {
    var els = getKeyEl(e)
    if (els) {
      while (els.length) els.pop().classList[method](className)
    }
  }
}

var keyMap = {
  8: 'delete',
  9: 'tab',
  13: 'return',
  16: 'shift',
  17: 'ctrl',
  18: 'alt, .keyboard-key.option',
  27: 'esc',
  32: 'space',
  91: 'cmd',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
}

function getKeyEl (e) {
  var char = String.fromCharCode(e.which)
  if (e.which >= 112 && e.which < 112 + 12) {
    char = 'f' + (e.which - 111)
  } else if (keyMap[e.which]) {
    char = keyMap[e.which]
  } else if (/\d/.test(char)) {
    char = ['zero','one','two','three','four', 'five','six','seven','eight','nine'][Number(char)]
  }
  if (char) {
    var charEl = document.querySelectorAll('.keyboard-key.' + char.toLowerCase())
    if (charEl.length) return [].slice.call(charEl)
  }
}