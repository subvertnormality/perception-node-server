const Queue = require('bull');
const _ = require('lodash');
const userQueue = new Queue('userQueue', '6379', 'redis');
const db = require('./db');
const userEvents = require('./events').userEvents;

var currentlyPlayingUserId;

userQueue.process(function(job, done) {

  currentlyPlayingUserId = job.data.userId;
  
  setTimeout(
    _.partial(userFinished, job.data.userId, done), 
    1000 * 15
  );
});


function userFinished(userId, done) {

  var user = db.factory('User');
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
      console.log('adding job ... ', job.jobId)
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

module.exports.addToQueue = addToQueue;
module.exports.isReadyToPlay = isReadyToPlay;