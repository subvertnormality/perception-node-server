const _ = require('lodash');
const request = require('./request');
const enableGuiControls = require('./gui-controls').enableGuiControls;
const disableGuiControls = require('./gui-controls').disableGuiControls;

const stream = document.getElementById('cozmoStream');
const queueStatus = document.getElementById('queueStatus');
const userHud = document.getElementById('userHud');
const logo = document.getElementById('logo');

let currentlyPlayingUserData;
let updateHudInterval;

function updateHud(httpRequest) {

  if (httpRequest.readyState === XMLHttpRequest.DONE) {
    if (httpRequest.status === 200 && httpRequest.response) {

      const response = JSON.parse(httpRequest.response);

      if (!response) {
        return;
      }

      if (response.systemStatus === false) {
        error();
        window.location = '/';
      }

      updateUserHud(response);
      updateQueueStatus(response);
      return;
    } else if (httpRequest.status >=400 && httpRequest.status < 500) {
      updateUserHud(false);     
      return; 
    } else {
      error();
      return;
    }
  }

  return;
}

function updateCurrentlyPlayingUserData(httpRequest) {

  if (httpRequest.readyState === XMLHttpRequest.DONE) {

    if (!httpRequest.response || httpRequest.status !== 200) {
      return defaultPlayingUserText;
    }

    const user = JSON.parse(httpRequest.response);

    currentlyPlayingUserData = user;
  }
}

function getCurrentlyPlayingContent() {

  const defaultPlayingUserText = 'Another user';

  const user = currentlyPlayingUserData;

  if (user && user.displayName) {
    return user.displayName;
  }
  
  return defaultPlayingUserText;
  
}

function error() {
  if (queueStatus){
    queueStatus.innerHTML = '<span class="consoleText">An error has occured.</span>';
    disableGuiControls();
  }
}

function updateQueueStatus(userQueueDetails) {
  if (!queueStatus) {
    return;
  }

  if (userQueueDetails.gamePlayerType !== 'hero') {
    disableGuiControls();
    queueStatus.innerHTML = '<span class="consoleText">Twitch chat is currently in control. The queue is still in place and will resume when chat scores. Go to <a href="https://www.twitch.tv/playperception">Twitch</a> to assist!</span>';
    return;
  }

  if (userQueueDetails.minutesLeftInQueue === false) {
    queueStatus.innerHTML = '<span class="consoleText">Connection established.</span>';
    enableGuiControls();
  } else if (userQueueDetails.minutesLeftInQueue > 0) {
    queueStatus.innerHTML = '<span class="consoleText">' + getCurrentlyPlayingContent() + 
      ' is in control.</span><br/><span class="consoleText">You are in the queue. Approximately ' + 
        userQueueDetails.minutesLeftInQueue + ' minute(s) remaining.</span>';

    throttledUpdateCurrentPlayer(updateCurrentlyPlayingUserData);

    disableGuiControls();
  }
};

function updateUserHud(userQueueDetails) {

  let userHudHtml;

  if (!queueStatus) {
    return;
  }

  if (!userQueueDetails) {
    logo.style.display = 'none';
    queueStatus.innerHTML = '<span class="consoleText">Credentials unknown. Connect to Twitch to take control.</span><br/><a href="/auth"><img class="connectWithTwitch" src="assets/connect_dark.png" alt="Login with Twitch" /></a>';
    userHudHtml = '';  
  } else {
    const logo = userQueueDetails.userLogo ? userQueueDetails.userLogo : 'assets/anon.png';
    userHudHtml =  
      '<img class="userLogo" src="' + logo + '" class="logo"><br/>' +
      '<span class="consoleText">' + userQueueDetails.userDisplayName + '</span>';
  }
  userHud.innerHTML = userHudHtml;
};


function requestAndUpdate() {
  request('/queue/user', updateHud);
}

const throttledUpdateCurrentPlayer = _.throttle(function throttledUpdateCurrentPlayer(callback) {
  request('/queue/currentlyplaying', callback);
}, 20000);

const throttledUpdateHud = _.throttle(requestAndUpdate, 30000)

function beginUpdatingHud() {
  if (!userHud) {
    return false;
  }
  updateHudInterval = window.setInterval(() => { throttledUpdateHud() }, 30000);
}

function stopUpdatingHud() {
  clearInterval(updateHudInterval);
}

module.exports.updateQueue;
module.exports.beginUpdatingHud = beginUpdatingHud;
module.exports.requestAndUpdate = requestAndUpdate;
module.exports.stopUpdatingHud = stopUpdatingHud;