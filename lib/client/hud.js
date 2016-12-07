const _ = require('lodash');
const request = require('./request');
const enableGuiControls = require('./gui-controls').enableGuiControls;
const disableGuiControls = require('./gui-controls').disableGuiControls;

const stream = document.getElementById('cozmoStream');
const queueStatus = document.getElementById('queueStatus');
const userHud = document.getElementById('userHud');

let cursorInterval;

function updateHud(httpRequest) {

  if (httpRequest.readyState === XMLHttpRequest.DONE) {
    if (httpRequest.status === 200 && httpRequest.response) {

      const response = JSON.parse(httpRequest.response);

      if (!response) {
        return;
      }

      throttledUpdateUserHud(response);
      updateQueueStatus(response);
      return;
    } else {
      throttledUpdateUserHud(false);
      return;
    }
  }

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

function updateQueueStatus(userQueueDetails) {

  if (!userQueueDetails.minutesLeftInQueue) {
    queueStatus.innerHTML = '<span class="consoleText">Connection established.</span>';
    enableGuiControls();
  } else {
    throttledUpdateCurrentPlayer((httpRequest) => {
      queueStatus.innerHTML = '<span class="consoleText">' + getCurrentlyPlayingContent(httpRequest) + 
        ' is in control.</span><br/><span class="consoleText">You are in the queue. Approximately ' + 
          userQueueDetails.minutesLeftInQueue + ' minute(s) remaining.</span>';
    });
    disableGuiControls();
  }
};

function activateCursorBlink() {
  const cursor = document.getElementById('cursor');
  cursorInterval = setInterval(function() {
    cursor.innerText === '_'? cursor.innerText = ' ' : cursor.innerText = '_';
  }, 500);
}

function deactivateCursorBlink() {
  clearInterval(cursorInterval);
}

const throttledUpdateUserHud = _.throttle(function updateUserHud(userQueueDetails) {

  let userHudHtml;
  if (!userQueueDetails) {
    queueStatus.innerHTML = '<span class="consoleText">Error. Credentials unknown. Cannot establish connection.<span class="consoleText">';
    userHudHtml = "<a href='/auth'><img src='assets/connect_dark.png' alt='Login with Twitch' /></a>";
  } else {
    const logo = userQueueDetails.userLogo ? userQueueDetails.userLogo : 'assets/anon.png';
    userHudHtml =  
      '<img src="' + logo + '" class="logo"><br/>' +
      '<span class="consoleText">' + userQueueDetails.userDisplayName + '</span>';
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