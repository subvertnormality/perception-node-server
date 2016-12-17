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
const gameRoutes = rewire(appRoot + '/lib/game-routes')
const game = require(appRoot + '/lib/game');

chai.use(sinonChai);

describe('Game routes', () => {
  const resetRewires = [];
  const processScore = gameRoutes.__get__('processScore');
  const res = {
    status: sinon.spy()
  };

  const config = {
    gamePointWin: 1,
    gamePointLoss: -1
  };

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

  it('successfully adds points to the game score', (done) => {

    processScore(game.currentGame, 'score', config.gamePointWin, (err) => {
      
      game.currentGame((err, game) => {
        expect(game.p('score')).to.equal(1);
        done();
      });
    });

  });

  it('successfully adds shame points to the game score', (done) => {

    processScore(game.currentGame, 'shame', config.gamePointWin, (err) => {
      
      game.currentGame((err, game) => {
        expect(game.p('shame')).to.equal(1);
        done();
      });
    });

  });

  it('successfully subtracts points to the game score', (done) => {

    game.currentGame((err, g) => {
      g.p('score', 11);
      g.save(() => {
        processScore(game.currentGame, 'score', config.gamePointLoss, (err) => {
          
          game.currentGame((err, g) => {
            expect(g.p('score')).to.equal(10);
            done();
          });
        });
      });
    });

  });

  it('a consequential negative score value results in a 0 score', (done) => {

    processScore(game.currentGame, 'score', config.gamePointLoss, (err) => {
      
      game.currentGame((err, g) => {
        expect(g.p('score')).to.equal(0);
        done();
      });
    });

  });

});