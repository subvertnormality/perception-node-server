'use strict';

const appRoot = require('app-root-path');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const rewire = require('rewire');
const db = require(appRoot + '/lib/db');
const redis = require(appRoot + '/lib/redis');
const _ = require('lodash');
const game = rewire(appRoot + '/lib/game');

chai.use(sinonChai);

describe('Game', () => {
  const resetRewires = [];

  before((done) => {
    redis.flushdb(() => {
      game.currentGame(done);
    });
  });

  afterEach((done) => {
    _.each(resetRewires, _.attempt);
    redis.flushdb(() => {
      done();
    });
  });

  it('successfully increments games played', (done) => {

    game.incrementGamesPlayed(() => {
      game.currentGame((err, g) => {
        expect(g.p('plays')).to.equal(1);
        done();
      });
    })

  });


  it('generates game cube location with each cube appearing once', (done) => {

    game.generateNewRound((err, round) => {
      const cubeLocation = round.configuration;

      expect(cubeLocation.length).to.equal(6);
      _.remove(cubeLocation, (loc) => loc === 1);
      expect(cubeLocation.length).to.equal(5);
      _.remove(cubeLocation, (loc) => loc === 2);
      expect(cubeLocation.length).to.equal(4);
      _.remove(cubeLocation, (loc) => loc === 3);
      expect(cubeLocation.length).to.equal(3);
      expect(cubeLocation[0]).to.equal(0);
      expect(cubeLocation[1]).to.equal(0);
      expect(cubeLocation[2]).to.equal(0);
      done();
    });

 
  });

  it('can start a new round', (done) => {

    game.startNewRound(() => {

      game.currentGame((err, g) => {
        expect(g.p('round').configuration).to.not.deep.equal([1, 2, 3, 0, 0, 0]);
        done();
      });

    });

  });

  it('can check win', (done) => {

    game.startNewRound(() => {
      game.currentGame((err, g) => {
        game.checkWin(g.p('round').configuration, (err, win) => {
          expect(win).to.be.true;
          done();
        });
      });
    });

  });


  it('can win round', (done) => {

    game.startNewRound(() => {
      game.currentGame((err, g) => {
        const round = g.p('round').configuration;
        game.winRound((err) => {
          game.currentGame((err, g2) => {
            expect(g2.p('score')).to.equal(1);
            expect(round).to.not.deep.equal(g2.p('round'));
            done();
          });
        });
      });
    });

  });
});