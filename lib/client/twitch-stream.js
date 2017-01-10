
const options = {
  width: '100%',
  height: '100%',
  channel: 'playperception',
};

const perceptionStream = document.getElementById('perceptionStream');
const player = perceptionStream ? new Twitch.Player('perceptionStream', options) : false;
const logo = document.getElementById('logo');

let started = false;

function stop() {
  if (player) {
    player.pause();
    logo.style.display = 'block';    
    perceptionStream.style.display = 'none';
    started = false;
  }
}

function start() {
  if (player && !started) {
    player.setQuality('low');
    player.play();
    logo.style.display = 'none';
    perceptionStream.style.display = 'block';
    started = true;
  }

}

module.exports.stop = stop;
module.exports.start = start;