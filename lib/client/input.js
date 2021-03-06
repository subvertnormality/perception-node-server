const socket = require('./socket');
const textInput = document.getElementById('sayTextId');
const hud = require('./hud');
const _ = require('lodash');
const hudConsole = require('./hud-console');
const countdown = require('./countdown');

// TODO: State here, nasty.
let commandInputModeStatus = false;

function handleKeyActivity(e, keyDown) {
  const keyCode = (e.keyCode ? e.keyCode : e.which);
  const hasCtrl = (e.ctrlKey ? 1 : 0)
  const hasAlt = (e.altKey ? 1 : 0)

  countdown.stopTimeoutCountdown();
  countdown.startTimeoutCountdown();

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

const throttledHandleTextInput = _.throttle(function handleTextInput(toSay) {
  const sanatisedToSay = _.lowerCase(_.deburr(toSay));
  hudConsole.speak(sanatisedToSay);
  socket.emit(
    'handle_say_text_event',
    { text: sanatisedToSay }
  );
}, 3000);

function inCommandMode() {
  return commandInputModeStatus;
}

function initialiseInput() {
  const commandPrompt = document.getElementById('commandPrompt');

  if (!commandPrompt) {
    return false;
  }

  document.addEventListener('keydown', function (e) { handleKeyActivity(e, true) });
  document.addEventListener('keyup', function (e) { handleKeyActivity(e, false) });

  commandPrompt.addEventListener('keydown', function (event) {
    commandPrompt.size = commandPrompt.value.length + 1;
    if (event.keyCode == 13) {
      throttledHandleTextInput(commandPrompt.value);
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