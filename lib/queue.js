const Queue = require('bull');
const _ = require('lodash');
const userQueue = new Queue('userQueue', '6379', 'redis');
const db = require('./db');
const userEvents = require('./events').userEvents;
const config = require('./config');
const game = require('./game');

// TODO: we should persist these in redis rather here
let currentlyPlayingUserId;
let currentJobId;
let currentJobTimeout;
let endCurrentJob;

userQueue.process(processJob);

function processJob(job, done) {

  currentlyPlayingUserId = job.data.userId;

  currentlyPlayingUser((err, user) => {
    if (err || Date.now() - user.p('queueLastUpdate') > config.queueTimeoutTime * 1000) {
      userIdle(user, done);
    } else {
      currentJobId = job.jobId;
      endCurrentJob = _.partial(userFinished, job.data.userId, done)
      currentJobTimeout = setTimeout(endCurrentJob, config.turnSpeed * 1000);
    }
  })
}

function userIdle(user, done) {

  user.p('queueJobId', 0);
  user.save((err) => {
    userEvents.emit('disconnect', user.id);
    done();
  });

}

function userFinished(userId, done) {
  const user = db.factory('User');
  user.load(userId, (err, properties) => {
    let userPlays = user.p('plays');
    user.p('queueJobId', 0);
    user.p('plays', userPlays + 1);
    user.save((err) => {
      game.incrementGamesPlayed(() => {
        userEvents.emit('disconnect', userId);
        currentlyPlayingUserId = '';
        done();
      });
    });

  });
}

function addToQueue(u) {
  const user = u;

  return new Promise(function(resolve, reject) {
    userQueue.add({userId: user.id, removeOnComplete: true}).then(function(job) {

        user.p('queueJobId', job.jobId);

        user.save(() => {
          resolve(null, user, job);
        });

      }).catch((err) => {
        reject(err);
      });
  });
}

function isReadyToPlay(user) {
  return user.id === currentlyPlayingUserId;
}

function minutesLeftInQueue(user) {

  let numberOfUsersAhead = user.p('queueJobId') - currentJobId;

  if (numberOfUsersAhead > 0) {
    return numberOfUsersAhead * (config.turnSpeed  / 60);
  } else {
    return false;
  }

}

function currentlyPlayingUser(callback) {

  if (!currentlyPlayingUserId) {
    callback(new Error('No user currently playing'));
    return;
  }

  const user = db.factory('User');
  user.load(currentlyPlayingUserId, function (err, properties) {
    callback(err, user);
  });
}

function endCurrentTurn() {
  clearTimeout(currentJobTimeout);
  endCurrentJob();
}

module.exports.addToQueue = addToQueue;
module.exports.isReadyToPlay = isReadyToPlay;
module.exports.minutesLeftInQueue = minutesLeftInQueue;
module.exports.currentlyPlayingUser = currentlyPlayingUser;
module.exports.endCurrentTurn = endCurrentTurn;