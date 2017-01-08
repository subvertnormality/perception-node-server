

const consoleElement = document.getElementById('console');

function prependText(text) {
  consoleElement.innerHtml = text + '<br />' + consoleElement.innerHtml;
}

function sayText(text, speaker) {
  if ('speechSynthesis' in window) {
    var msg = new SpeechSynthesisUtterance(toSay);
    msg.pitch = 2;
    window.speechSynthesis.speak(msg);
  }
}

function handleMessage(message) {
  prependText(message.said);
  setTimeout(() => {
    prependText(message.reply);
  }, 5000);
}

          // socket.emit('text_response', {
          //   said: payload['text'],
          //   reply: res.message
          // });