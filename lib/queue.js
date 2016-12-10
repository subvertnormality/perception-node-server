const Queue = require('bull');
const _ = require('lodash');
const userQueue = new Queue('userQueue', '6379', 'redis');
const db = require('./db');
const userEvents = require('./events').userEvents;
const config = require('./config');

// TODO: we should persist these in redis rather here
let currentlyPlayingUserId;
let currentJobId;
let currentJobTimeout;
let endCurrentJob;

userQueue.process(function(job, done) {

  currentlyPlayingUserId = job.data.userId;
  currentJobId = job.jobId;
  endCurrentJob = _.partial(userFinished, job.data.userId, done)
  currentJobTimeout = setTimeout(endCurrentJob, config.turnSpeed);
});

function userFinished(userId, done) {

  const user = db.factory('User');
  user.load(userId, function (err, properties) {
    user.p('queueJobId', 0);
    user.p('plays', user.p('plays') + 1);
    user.save((err) => {

      userEvents.emit('disconnect', userId);
      done();

    });

  });
}

function addToQueue(u) {

  const user = u;

  return new Promise(function(resolve, reject) {
    userQueue.add({userId: user.id, removeOnComplete: true}).then(function(job) {

        user.p('queueJobId', job.jobId);

        user.save(() => {
          resolve(user);
        });

      }).catch((err) => reject(err));
  });
}

function isReadyToPlay(user) {
  return user.id === currentlyPlayingUserId;
}

function minutesLeftInQueue(user) {

  let numberOfUsersAhead = user.p('queueJobId') - currentJobId;

  if (numberOfUsersAhead > 0) {
    return numberOfUsersAhead * (config.turnSpeed / 1000 / 60);
  } else {
    return false;
  }

}

function currentlyPlayingUser(callback) {

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