const socket = require('./socket');
const textInput = document.getElementById('sayTextId');
const hud = require('./hud');
const _ = require('lodash');

// TODO: State here, nasty.
let commandInputModeStatus = false;

function handleKeyActivity(e, keyDown) {
  const keyCode = (e.keyCode ? e.keyCode : e.which);
  const hasCtrl = (e.ctrlKey ? 1 : 0)
  const hasAlt = (e.altKey ? 1 : 0)

  if (e.keyCode === 13 && e.type === 'keydown') {
    const commandPrompt = document.getElementById('commandPrompt');
    commandPrompt.addEventListener('blur', function (event) { 
      commandPrompt.focus();
    });

    commandInputMode();
  }

  if (!commandInputModeStatus) {
    socket.emit(
      'handle_key_event',
      { 'key_code': keyCode, 'is_shift_down': 1, 'is_ctrl_down': hasCtrl, 'is_alt_down': hasAlt, 'is_key_down': keyDown }
    );
  }
}

const commandInputMode = function commandInputMode() {

  const commandContainer = document.getElementById('commandContainer');
  const commandPrompt = document.getElementById('commandPrompt');

  if (!commandInputModeStatus) { 
    commandPrompt.value = '';
    commandContainer.style.display = 'block';
    commandPrompt.focus();
  }
  commandInputModeStatus = commandInputModeStatus ? false : true;

};

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
  const commandPrompt = document.getElementById('commandPrompt');

  document.addEventListener('keydown', function (e) { handleKeyActivity(e, true) });
  document.addEventListener('keyup', function (e) { handleKeyActivity(e, false) });

  commandPrompt.addEventListener('keydown', function (event) {
    commandPrompt.size = commandPrompt.value.length + 1;
    if (event.keyCode == 13) {
      handleTextInput(commandPrompt.value);
      commandPrompt.removeEventListener('blur', () => {});
      commandPrompt.blur();
      commandPrompt.size = 1;
      commandContainer.style.display = 'none';
    }
    return true;
  });
}

module.exports.initialiseInput = initialiseInput;
module.exports.inCommandMode = inCommandMode;