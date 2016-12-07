const socket = require('./socket');
const textInput = document.getElementById('sayTextId');
const hud = require('./hud');
const _ = require('lodash');

const textToSayContainer = document.getElementById('textToSay');

// TODO: State here, nasty.
let commandInputModeStatus = false;
let textToSay = '';

function updateTextToSay(e) {
  if (e.keyCode === 8) {
    textToSay = textToSay.substring(0, textToSay.length - 1)
  } else if (e.keyCode !== 13) { 
    textToSay += String.fromCharCode(e.keyCode);
  }

  textToSayContainer.innerText = textToSay;
}

function handleKeyActivity(e, keyDown) {
  var keyCode = (e.keyCode ? e.keyCode : e.which);
  var hasShift = (e.shiftKey ? 1 : 0)
  var hasCtrl = (e.ctrlKey ? 1 : 0)
  var hasAlt = (e.altKey ? 1 : 0)

  if (e.keyCode === 13 && e.type === 'keydown') {
    commandInputMode();
  } 
  
  if (commandInputModeStatus && e.type === 'keydown') {

      if (textToSayContainer) {
        updateTextToSay(e);
      }
  } else {
    socket.emit(
      'handle_key_event',
      { 'key_code': keyCode, 'is_shift_down': hasShift, 'is_ctrl_down': hasCtrl, 'is_alt_down': hasAlt, 'is_key_down': keyDown }
    );
  }
}

const commandInputMode =  _.throttle(function commandInputMode() {

  commandInputModeStatus = commandInputModeStatus ? false : true;

  if (commandInputModeStatus) {

    const commandPrompt = document.getElementById('commandPrompt');
    commandPrompt.innerHTML = '<span class="consoleText" id="say">Say></span><span class="consoleText" id="textToSay"></span><span class="consoleText" id="cursor"></span>';
    hud.activateCursorBlink();
    
  } else {
    const commandPrompt = document.getElementById('commandPrompt');
    while (commandPrompt.hasChildNodes()) {
        commandPrompt.removeChild(commandPrompt.firstChild);
    }
    handleTextInput(textToSay);
    textToSay = '';
    hud.deactivateCursorBlink();
  }

}, 500);

function handleTextInput(toSay) {
  socket.emit(
    'handle_say_text_event',
    { text: _.lowerCase(_.deburr(toSay)) }
  );
  if ('speechSynthesis' in window) {
    var msg = new SpeechSynthesisUtterance(toSay);
    msg.pitch = 2;
    window.speechSynthesis.speak(msg);
  }
}

document.addEventListener('keydown', function (e) { handleKeyActivity(e, true) });
document.addEventListener('keyup', function (e) { handleKeyActivity(e, false) });