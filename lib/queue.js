const Queue = require('bull');
const _ = require('lodash');
const userQueue = new Queue('userQueue', '6379', 'redis');
const db = require('./db');
const userEvents = require('./events').userEvents;
const config = require('./config');
const game = require('./game');
const logger = require('./logger');

// TODO: we should persist these in redis rather here
let currentlyPlayingUserId;
let currentJobId;
let currentJobTimeout;
let endCurrentJob;
let currentPlayerMode;

userQueue.process(processJob);

function processJob(job, done) {

  currentlyPlayingUserId = job.data.userId;

  currentlyPlayingUser((err, user) => {
    if (err || Date.now() - user.p('queueLastUpdate') > config.queueTimeoutTime * 1000) {
      if (err) {
        logger.error(err + ' : User idled because of queue error. User ID: ', currentlyPlayingUserId);
      } else {
        logger.info('User disconnected because of Idle. ID: ', currentlyPlayingUserId);
      }
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
        game.playerMode((err, mode) => {
          if (mode === 'twitch') {
            setToTwitchMode(() => done());
          } else {
            setToHeroMode(() => done());
          }
        });
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

function pauseQueue(callback) {
  userQueue.pause().then(() => {
    callback(null, true);
  });
}

function resumeQueue(callback) {
  userQueue.resume().then(() => {
    callback(null, true);
  });
}

function setToTwitchMode(callback) {
  pauseQueue(() => {
    currentPlayerMode = 'twitch';  
    callback();
  }); 
}

function setToHeroMode(callback) {
  resumeQueue(() => {
    currentPlayerMode = 'hero';
    callback();
  })
}

function currentPlayerMode() {
  return currentPlayerMode;
}

module.exports.addToQueue = addToQueue;
module.exports.isReadyToPlay = isReadyToPlay;
module.exports.minutesLeftInQueue = minutesLeftInQueue;
module.exports.currentlyPlayingUser = currentlyPlayingUser;
module.exports.endCurrentTurn = endCurrentTurn;
module.exports.currentPlayerMode = currentPlayerMode;