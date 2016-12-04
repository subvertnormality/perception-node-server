const socket = require('./socket');
const textInput = document.getElementById('sayTextId');

function handleKeyActivity(e, keyDown) {
  var keyCode = (e.keyCode ? e.keyCode : e.which);
  var hasShift = (e.shiftKey ? 1 : 0)
  var hasCtrl = (e.ctrlKey ? 1 : 0)
  var hasAlt = (e.altKey ? 1 : 0)
  console.log(socket)
  socket.emit(
    'handle_key_event',
    { 'key_code': keyCode, 'is_shift_down': hasShift, 'is_ctrl_down': hasCtrl, 'is_alt_down': hasAlt, 'is_key_down': keyDown }
  );
}

function handleTextInput(toSay) {
  socket.emit(
    'handle_say_text_event',
    { text: toSay }
  );
}

function handleTextKeyDown(event) {
  event.stopPropagation();
  if (event.keyCode === 13) {
    handleTextInput(textInput.value); 
  }
};

document.addEventListener('keydown', function (e) { handleKeyActivity(e, true) });
document.addEventListener('keyup', function (e) { handleKeyActivity(e, false) });

textInput.onkeydown = handleTextKeyDown;