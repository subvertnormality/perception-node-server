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

});