
const options = {
  width: '100%',
  height: '100%',
  channel: 'playperception',
};

const perceptionStream = document.getElementById('perceptionStream');
const player = perceptionStream ? new Twitch.Player('perceptionStream', options) : false;

let started = false;

function stop() {
  if (player) {
    player.pause();
    perceptionStream.style.display = 'none';
    started = false;
  }
}

function start() {
  if (player && !started) {
    player.setQuality('low');
    player.play();
    perceptionStream.style.display = 'block';
    started = true;
  }

}

module.exports.stop = stop;
module.exports.start = start;