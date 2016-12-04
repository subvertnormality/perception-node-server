const socket = require('./socket');
const textInput = document.getElementById('sayTextId');
const _ = require('lodash');
let commandInputModeStatus = false;
let cursorInterval;
let textToSay = '';

function handleKeyActivity(e, keyDown) {
  var keyCode = (e.keyCode ? e.keyCode : e.which);
  var hasShift = (e.shiftKey ? 1 : 0)
  var hasCtrl = (e.ctrlKey ? 1 : 0)
  var hasAlt = (e.altKey ? 1 : 0)

  if (e.keyCode === 13 && e.type === 'keydown') {
    commandInputMode();
  } 
  
  if (commandInputModeStatus && e.type === 'keydown') {

      const textToSayContainer = document.getElementById('textToSay');
      if (textToSayContainer) {
          if (e.keyCode === 8) {
            textToSay = textToSay.substring(0, textToSay.length - 1)
          } else if (e.keyCode !== 13) { 
            textToSay += String.fromCharCode(e.keyCode);
          }

          textToSayContainer.innerText = textToSay;
      }
  } else {
    socket.emit(
      'handle_key_event',
      { 'key_code': keyCode, 'is_shift_down': hasShift, 'is_ctrl_down': hasCtrl, 'is_alt_down': hasAlt, 'is_key_down': keyDown }
    );
  }
}

function activateCursor() {
  const cursor = document.getElementById('cursor');

  cursorInterval = setInterval(function() {
    cursor.innerText === '_'? cursor.innerText = ' ' : cursor.innerText = '_';
  }, 500);
}

function deactivateCursor() {
  clearInterval(cursorInterval);
}

const commandInputMode =  _.throttle(function commandInputMode() {

  commandInputModeStatus = commandInputModeStatus ? false : true;

  if (commandInputModeStatus) {

    const commandPrompt = document.getElementById('commandPrompt');
    commandPrompt.innerHTML = '<span class="consoleText" id="say">Say></span><span class="consoleText" id="textToSay"></span><span class="consoleText" id="cursor"></span>';
    activateCursor();
    
  } else {
    const commandPrompt = document.getElementById('commandPrompt');
    while (commandPrompt.hasChildNodes()) {
        commandPrompt.removeChild(commandPrompt.firstChild);
    }
    handleTextInput(textToSay);
    textToSay = '';
    deactivateCursor();
  }


}, 500);

function handleTextInput(toSay) {
  socket.emit(
    'handle_say_text_event',
    { text: _.lowerCase(_.deburr(toSay)) }
  );
}

document.addEventListener('keydown', function (e) { handleKeyActivity(e, true) });
document.addEventListener('keyup', function (e) { handleKeyActivity(e, false) });