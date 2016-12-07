const _ = require('lodash');
const request = require('./request');
const enableGuiControls = require('./gui-controls').enableGuiControls;
const disableGuiControls = require('./gui-controls').disableGuiControls;

const stream = document.getElementById('cozmoStream');
const queueStatus = document.getElementById('queueStatus');
const cursor = document.getElementById('cursor');
const userHud = document.getElementById('userHud');

let cursorInterval;

function updateHud(httpRequest) {

  let text = 'Error. Credentials unknown. Cannot establish connection.';
  if (httpRequest.readyState === XMLHttpRequest.DONE) {
    if (httpRequest.status === 200 && httpRequest.response) {

      const response = JSON.parse(httpRequest.response);

      throttledUpdateUserHud(response);
      updateQueueStatus(response);
      enableGuiControls();
      return;
    }
  }

  throttledUpdateUserHud(false);
  disableGuiControls();
  return;
  
}

function getCurrentlyPlayingContent(httpRequest) {

  const defaultPlayingUserText = 'Another user';

  if (httpRequest.readyState === XMLHttpRequest.DONE) {

    if (!httpRequest.response || httpRequest.status !== 200) {
      return defaultPlayingUserText;
    }

    const user = JSON.parse(httpRequest.response);

    if (user.displayName) {
      return user.displayName + ' ('+ user.plays + ' plays)';
    }
    
    return defaultPlayingUserText;
    
  }
}

function updateQueueStatus(httpRequest) {

  if (!response.minutesLeftInQueue) {
    queueStatus.innerHTML = '<span class="consoleText">Connection established.</span>';
    document.getElementById('controls').style.display = 'block';
  } else {
    throttledUpdateCurrentPlayer((httpRequest) => {
      document.getElementById('controls').style.display = 'none';
      queueStatus.innerHTML = '<span class="consoleText">' + getCurrentlyPlayingContent(httpRequest) + 
        ' is in control.</span><br/><span class="consoleText">You are in the queue. Approximately ' + 
          response.minutesLeftInQueue + ' minute(s) remaining.</span>';
    });
  }
};

function activateCursorBlink() {

  cursorInterval = setInterval(function() {
    cursor.innerText === '_'? cursor.innerText = ' ' : cursor.innerText = '_';
  }, 500);
}

function deactivateCursorBlink() {
  clearInterval(cursorInterval);
}

const throttledUpdateUserHud =  _.throttle(function updateUserHud(userQueueDetails) {
  
  let userHudHtml;
  if (!userQueueDetails) {
    userHudHtml = "<a href='/auth'><img src='assets/connect_dark.png' alt='Login with Twitch' /></a>";
  } else {
    const logo = userQueueDetails.userLogo ? userQueueDetails.userLogo : 'assets/anon.png';
    userHudHtml =  
      "<img src='" + logo + "' class='logo'><br/>" +
      "<span class='consoleText'>" + userQueueDetails.userDisplayName + "</span>";
  }
  userHud.innerHTML = userHudHtml;
}, 20000);

const throttledUpdateCurrentPlayer = _.throttle(function throttledUpdateCurrentPlayer(callback) {
  request('/queue/currentlyplaying', callback);
}, 20000);

const throttledUpdateHud = _.throttle(function throttledUpdateHud() {
  request('/queue/user', updateHud);
}, 2000)

function beginUpdatingHud() {
  if (!userHud) {
    return false;
  }
  window.setInterval(() => { throttledUpdateHud() }, 2000);
}

module.exports.updateQueue;
module.exports.beginUpdatingHud = beginUpdatingHud;
module.exports.activateCursorBlink = activateCursorBlink;
module.exports.deactivateCursorBlink = deactivateCursorBlink;