const _ = require('lodash');
const request = require('./request');

module.exports = function hud() {
  const canvas = document.getElementById('cozmoStream');
  let currentlyPlayingUser = 'Another user';

  function updateHud(httpRequest) {

    let text = 'Error. Credentials unknown. Cannot establish connection.';
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {

        if (!httpRequest.response) {
          return;
        }
        const response = JSON.parse(httpRequest.response);

        updateUserHud(response)

        text = '';
        if (!response.minutesLeftInQueue) {
          text = 'Connection established. Awaiting command...';
          document.getElementById('controls').style.display = 'block';
        } else {
          updateCurrentPlayer();
          document.getElementById('controls').style.display = 'none';
          text = currentlyPlayingUser + 
            ' is in control.</span><br/><span class="consoleText">You are in the queue. Approximately ' + 
              response.minutesLeftInQueue + ' minute(s) remaining.</span>';
        }
      } else {
        updateUserHud(false);
        document.getElementById('controls').style.display = 'none';
      }
      
      document.getElementById('queueStatus').innerHTML = "<span class='consoleText'>" + text + "</span>";
    }
  }

  function updateCurrentlyPlayingContent(httpRequest) {

    if (httpRequest.readyState === XMLHttpRequest.DONE) {

      if (!httpRequest.response || httpRequest.status !== 200) {
        return;
      }

      const user = JSON.parse(httpRequest.response);

      if (user.displayName) {
        currentlyPlayingUser = user.displayName + ' ('+ user.plays + ' plays)';
      } else {
        currentlyPlayingUser = 'Another user';
      }
      
    }
  }

  const updateUserHud =  _.throttle(function updateUserHud(userQueueDetails) {
    const userHud = document.getElementById('userHud');
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



  const updateCurrentPlayer = _.throttle(function updateCurrentPlayer() {
    request('/queue/currentlyplaying', updateCurrentlyPlayingContent);
  }, 20000);

  const updateQueue = _.throttle(function updateQueue() {
    request('/queue/user', updateHud);
  }, 2000)

  window.setInterval(() => { updateQueue() }, 2000);
};