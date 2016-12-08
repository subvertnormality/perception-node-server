const socket = require('./socket');
const textInput = document.getElementById('sayTextId');
const hud = require('./hud');
const _ = require('lodash');

// TODO: State here, nasty.
let commandInputModeStatus = false;
let textToSay = '';

function updateTextToSay(e, textToSayContainer) {
  if (e.keyCode === 8) {
    textToSay = textToSay.substring(0, textToSay.length - 1)
  } else if (e.keyCode !== 13) { 
    textToSay += String.fromCharCode(e.keyCode);
  }

  textToSayContainer.innerText = textToSay;
}

function handleKeyActivity(e, keyDown) {
  const keyCode = (e.keyCode ? e.keyCode : e.which);
  const hasCtrl = (e.ctrlKey ? 1 : 0)
  const hasAlt = (e.altKey ? 1 : 0)

  if (e.keyCode === 13 && e.type === 'keydown') {
    commandInputMode();
  } 
  
  if (commandInputModeStatus && e.type === 'keydown') {
      const textToSayContainer = document.getElementById('textToSay');
      if (textToSayContainer) {
        updateTextToSay(e, textToSayContainer);
      }
  } else {
    socket.emit(
      'handle_key_event',
      { 'key_code': keyCode, 'is_shift_down': 1, 'is_ctrl_down': hasCtrl, 'is_alt_down': hasAlt, 'is_key_down': keyDown }
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

function inCommandMode() {
  return commandInputModeStatus;
}

function initialiseInput() {
  document.addEventListener('keydown', function (e) { handleKeyActivity(e, true) });
  document.addEventListener('keyup', function (e) { handleKeyActivity(e, false) });
}

module.exports.initialiseInput = initialiseInput;
module.exports.inCommandMode = inCommandMode;