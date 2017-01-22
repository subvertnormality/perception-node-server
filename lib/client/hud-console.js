

const consoleElement = document.getElementById('console');
let voices;

window.speechSynthesis.onvoiceschanged = function() {
  voices = window.speechSynthesis.getVoices();
}

function prependText(text) {
  let child = document.createElement('div');
  child.innerHTML = text;
  consoleElement.insertBefore(child, consoleElement.firstChild);
  setTimeout(function() {
    child.outerHTML = '';
  }, 20000);
}

function sayText(text, speaker) {
  if ('speechSynthesis' in window) {
    var msg = new SpeechSynthesisUtterance(text);
    msg.pitch = 1;
    msg.voice = voices[speaker];
    window.speechSynthesis.speak(msg);
  }
}

function handleMessage(message) {
  setTimeout(() => {
    prependText('???: ' + message.reply);
    sayText(message.reply, 3);
  }, message.said.length * 500);
}

function speak(text) {
  prependText('Player: '+ text);
  sayText(text, 0);
}

module.exports.handleMessage = handleMessage;
module.exports.speak = speak; 