var playCountDownTimeout;
var timeoutCountDownTimer;

function startTimer(duration, display, prefix) {
    var timer = duration, minutes, seconds;
    return setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = prefix + ' ' + minutes + ":" + seconds;

        if (--timer < 0) {
            timer = 0, 0, 0;
        }
    }, 1000);
}

function startPlayCountdown() {
  document.getElementById('counters').style.display = 'block';
  document.getElementById('playCount').style.display = 'block';
  let playCountDown = document.getElementById('playCount').firstChild;
  playCountDownTimeout = startTimer(config.playTime, playCountDown, 'Control time left: ')
}

function stopPlayCountdown() {
  document.getElementById('playCount').style.display = 'none';
  let playCountDown = document.getElementById('playCount').firstChild;
  clearTimeout(playCountDownTimeout);
  playCountDown.innerHtml = '';
}

function startTimeoutCountdown() {
  document.getElementById('counters').style.display = 'block';
  document.getElementById('timeoutCount').style.display = 'block';
  let timeoutCountDown = document.getElementById('timeoutCount').firstChild;
  timeoutCountDownTimer = startTimer(config.timeoutTime, timeoutCountDown, 'Inactivity timeout in: ')
}

function stopTimeoutCountdown() {
  document.getElementById('timeoutCount').style.display = 'none';
  let timeoutCountDown = document.getElementById('timeoutCount').firstChild;
  clearTimeout(timeoutCountDownTimer);
  timeoutCountDown.innerHtml = '';
}

module.exports.startPlayCountdown = startPlayCountdown;
module.exports.stopPlayCountdown = stopPlayCountdown;
module.exports.startTimeoutCountdown = startTimeoutCountdown;
module.exports.stopTimeoutCountdown = stopTimeoutCountdown;