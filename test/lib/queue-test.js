'use strict';

const appRoot = require('app-root-path');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const rewire = require('rewire');
const queue = rewire(appRoot + '/lib/queue');
const db = require(appRoot + '/lib/db');
const redis = require('ioredis');
const _ = require('lodash');
const PriorityQueue = require('bull/lib/priority-queue');

chai.use(sinonChai);

describe('Queue', () => {
  const resetRewires = [];
  const userQueue = queue.__get__('userQueue');
  const userName = 'test';

  function getFreshUser() {
    let user = db.factory('User');
    user.p('name', 'test');
    user.p('email', 'test@test.com');
    user.p('displayName', 'Test');
    user.p('plays', 0);
    user.p('queueJobId', 0);
    return user;
  }
 
  before((done) => {
    redis.createClient('6379', 'redis').flushdb(done);
  });

  afterEach((done) => {
    _.each(resetRewires, _.attempt);
    redis.createClient('6379', 'redis').flushdb(() => {
      queue.__set__('currentlyPlayingUserId', '');    
      userQueue.empty().then(() => {
        done();
      });
    });
  });


  describe('when adding new user', () => {
  
    let user;

    beforeEach((done) => {
      user = getFreshUser();
      user.save((err) => {
        done();
      });
    });

    it('puts them on the queue', (done) => {

      queue.addToQueue(user).then((user) => {
        userQueue.getJob(user.p('queueJobId')).then((job) => {
          expect(job.data.userId).to.equal(user.id);
          done();
        });

      });
    });
  });

  describe('is empty and one user is added', (done) => {

    let user;

    beforeEach((done) => {
      user = getFreshUser();
      user.save(done);
    });

    it('that user should be ready to play', () => {

      queue.addToQueue(user).then((user) => {

        userQueue.on('active', function(job, result){
          if (job.jobId == user.p('queueJobId')) {
            const isReadyToPlay = queue.isReadyToPlay(user);
            expect(isReadyToPlay).to.be.true;
            done();
          }
        })
      });

    });

  });

  describe('when user is finished', (done) => {

    let user;
    let userFinished;

    beforeEach((done) => {
      userFinished = queue.__get__('userFinished');
      user = getFreshUser();
      user.p('queueJobId', 1);
      user.save((err) => {
        done();
      });
    });

    it('user queue id should be set to 0', (done) => {

      userFinished(user.id, () => {
        user.load(user.id, function (err, properties) {
          expect(user.p('queueJobId')).to.equal(0);
          done();
        });
      });

    });

    it('user plays should be incremented', (done) => {

      userFinished(user.id, () => {
        user.load(user.id, function (err, properties) {
          expect(user.p('plays')).to.equal(1);
          done();
        });
      });

    });
  });
});