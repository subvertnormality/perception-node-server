'use strict';

const appRoot = require('app-root-path');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const rewire = require('rewire');
const queue = rewire(appRoot + '/lib/queue');
const db = require(appRoot + '/lib/db');
const redis = require(appRoot + '/lib/redis');
const _ = require('lodash');

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
    redis.flushdb(done);
  });

  afterEach((done) => {
    _.each(resetRewires, _.attempt);
    redis.flushdb(() => {
      queue.__set__('currentlyPlayingUserId', '');    
      userQueue.empty().then(() => {
        done();
      });
    });
  });


  describe('when adding new user', () => {
  
    let user;
    let socketStub;

    beforeEach((done) => {
      user = getFreshUser();
      user.save((err) => {
        done();
      });
    });

    it('puts them on the queue and sets the user as ready to play', (done) => {
      userQueue.on('active', (job, result) => {
        if (job.jobId == user.p('queueJobId')) {
          const isReadyToPlay = queue.isReadyToPlay(user);
          expect(isReadyToPlay).to.be.true;
          done();
        }
      })

      queue.addToQueue(user).then((user) => {
        userQueue.getJob(user.p('queueJobId')).then((job) => {
          expect(job.data.userId).to.equal(user.id);
        });
      });
    }).timeout(5000);

  });

  describe('when user is finished', () => {

    let user;
    let userFinished;
    let userEvents;
    let userEventsSpy;
    let game;
    let gameStub;

    beforeEach((done) => {
      userFinished = queue.__get__('userFinished');
      userEvents = queue.__get__('userEvents');
      userEventsSpy = sinon.spy(userEvents, 'emit');
      game = queue.__get__('game');      
      gameStub = sinon.stub(game, 'incrementGamesPlayed');
      gameStub.yields();
      user = getFreshUser();
      user.p('queueJobId', 1);
      user.save((err) => {
        done();
      });
    });

    afterEach(() => {
      userEvents.emit.restore();
      gameStub.restore();
    });

    it('user queue id should be set to 0', (done) => {

      userFinished(user.id, () => {
        user.load(user.id, (err, properties) => {
          expect(user.p('queueJobId')).to.equal(0);
          done();
        });
      });

    });

    it('user plays should be incremented', (done) => {

      userFinished(user.id, () => {
        user.load(user.id, (err, properties) => {
          expect(user.p('plays')).to.equal(1);
          done();
        });
      });

    });

    it('user plays should be incremented correctly when bigger than 0', (done) => {

      userFinished(user.id, () => {
        userFinished(user.id, () => {
          userFinished(user.id, () => {
            user.load(user.id, (err, properties) => {
              expect(user.p('plays')).to.equal(3);
              done();
            });
          });
        });
      });

    });

    it('user disconnect event should be emitted', (done) => {

      userFinished(user.id, () => {
        user.load(user.id, (err, properties) => {
          expect(userEventsSpy).to.have.been.calledWith('disconnect', user.id);
          done();
        });
      });

    });
  });

  describe('job process', () => {

    let user;
    let processJob;
    let job;

    beforeEach((done) => {
      processJob = queue.__get__('processJob');
      user = getFreshUser();
      user.p('queueJobId', 1);
      user.p('queueLastUpdate', Date.now() - 10 * 1000 * 60);
      user.save((err) => {
        job = {
          data: {
            userId: user.id,
            jobId: 1
          }
        }
        done();
      });

    });


    it('job should be skipped if user queue timestamp is too small', (done) => {

      processJob(job, () => {
        user.load(user.id, (err, properties) => {
          expect(user.p('queueJobId')).to.equal(0);
          expect(user.p('plays')).to.equal(0);
          done();
        });
      })

    });

  });
});