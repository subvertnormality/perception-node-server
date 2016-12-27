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
  let shuffleStub;

  before((done) => {
    _.shuffle = _.reverse;
    _.random = _.constant(0);
    resetRewires.push(game.__set__('_', _));
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
        expect(g.p('round').level).to.equal(0);
        expect(g.p('round').configuration).to.deep.equal([0, 0, 0, 3, 2, 1]);
        expect(g.p('round').data.name).to.deep.equal('major');
        expect(g.p('round').data.complete).to.be.false;
        expect(g.p('round').data.clue).to.equal('_ a j o r');
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

  it('round 0 is still active at score 49', (done) => {

    game.startNewRound(() => {
      game.currentGame((err, g) => {
        g.p('score', 49);
        g.save((err) => {
          game.generateNewRound((err, round) => {
            expect(round.level).to.equal(0);
            done();
          });
        })
      });
    });

  });

  it('round 1 begins at score 50', (done) => {

    game.startNewRound(() => {
      game.currentGame((err, g) => {
        g.p('score', 50);
        g.save((err) => {
          game.generateNewRound((err, round) => {
            expect(round.level).to.equal(1);
            done();
          });
        })
      });
    });

  });

  it('round 1 still at score 99', (done) => {

    game.startNewRound(() => {
      game.currentGame((err, g) => {
        g.p('score', 99);
        g.save((err) => {
          game.generateNewRound((err, round) => {
            expect(round.level).to.equal(1);
            done();
          });
        })
      });
    });

  });

  it('round 2 begins at score 100', (done) => {

    game.startNewRound(() => {
      game.currentGame((err, g) => {
        g.p('score', 100);
        g.save((err) => {
          game.generateNewRound((err, round) => {
            expect(round.level).to.equal(2);
            done();
          });
        })
      });
    });

  });

  it('round 61 at score 3098', (done) => {

    game.startNewRound(() => {
      game.currentGame((err, g) => {
        g.p('score', 3098);
        g.save((err) => {
          game.generateNewRound((err, round) => {
            expect(round.level).to.equal(61);
            done();
          });
        })
      });
    });

  });

  it('round clue has one space at level 1', (done) => {

    game.startNewRound(() => {
      game.currentGame((err, g) => {
        g.p('score', 52);
        g.save((err) => {
          game.generateNewRound((err, round) => {
            expect(round.level).to.equal(1);
            expect(round.data.name).to.deep.equal('coach');
            expect(round.data.clue).to.equal('_ _ a c h');
            done();
          });
        })
      });
    });
  });

  it('round clue has two spaces at level 4', (done) => {

    game.startNewRound(() => {
      game.currentGame((err, g) => {
        g.p('score', 102);
        g.save((err) => {
          game.generateNewRound((err, round) => {
            expect(round.level).to.equal(2);
            expect(round.data.name).to.deep.equal('brand');
            expect(round.data.clue).to.equal('_ _ a n d');
            done();
          });
        })
      });
    });
  });


  it('round clue has three spaces at level 5', (done) => {

    game.startNewRound(() => {
      game.currentGame((err, g) => {
        g.p('score', 252);
        g.save((err) => {
          game.generateNewRound((err, round) => {
            expect(round.level).to.equal(5);
            expect(round.data.name).to.deep.equal('clock');
            expect(round.data.clue).to.equal('_ _ _ c k');
            done();
          });
        })
      });
    });
  });

  it('round clue has three spaces at level 9', (done) => {

    game.startNewRound(() => {
      game.currentGame((err, g) => {
        g.p('score', 499);
        g.save((err) => {
          game.generateNewRound((err, round) => {
            expect(round.level).to.equal(9);
            expect(round.data.name).to.deep.equal('module');
            expect(round.data.clue).to.equal('_ _ _ u l e');
            done();
          });
        })
      });
    });
  });

  it('round clue has four spaces at level 10', (done) => {

    game.startNewRound(() => {
      game.currentGame((err, g) => {
        g.p('score', 501);
        g.save((err) => {
          game.generateNewRound((err, round) => {
            expect(round.level).to.equal(10);
            expect(round.data.name).to.deep.equal('rugby');
            expect(round.data.clue).to.equal('_ _ _ _ y');
            done();
          });
        })
      });
    });
  });

  it('round clue has five spaces at level 20', (done) => {

    game.startNewRound(() => {
      game.currentGame((err, g) => {
        g.p('score', 1001);
        g.save((err) => {
          game.generateNewRound((err, round) => {
            expect(round.level).to.equal(20);
            expect(round.data.name).to.deep.equal('compulsive');
            expect(round.data.clue).to.equal('_ _ _ _ _ l s i v e');
            done();
          });
        })
      });
    });
  });

  it('round clue has six spaces at level 40', (done) => {

    game.startNewRound(() => {
      game.currentGame((err, g) => {
        g.p('score', 2001);
        g.save((err) => {
          game.generateNewRound((err, round) => {
            expect(round.level).to.equal(40);
            expect(round.data.name).to.deep.equal('cookout');
            expect(round.data.clue).to.equal('_ _ _ _ _ _ t');
            done();
          });
        })
      });
    });
  });

  it('round clue has seven spaces at level 60', (done) => {

    game.startNewRound(() => {
      game.currentGame((err, g) => {
        g.p('score', 3001);
        g.save((err) => {
          game.generateNewRound((err, round) => {
            expect(round.level).to.equal(60);
            expect(round.data.name).to.deep.equal('groundfish');
            expect(round.data.clue).to.equal('_ _ _ _ _ _ _ i s h');
            done();
          });
        })
      });
    });
  });

  it('round clue has eight spaces at level 80', (done) => {

    game.startNewRound(() => {
      game.currentGame((err, g) => {
        g.p('score', 4001);
        g.save((err) => {
          game.generateNewRound((err, round) => {
            expect(round.level).to.equal(80);
            expect(round.data.name).to.deep.equal('sinologist');
            expect(round.data.clue).to.equal('_ _ _ _ _ _ _ _ s t');
            done();
          });
        })
      });
    });
  });

  it('round clue has nine spaces at level 103', (done) => {

    game.startNewRound(() => {
      game.currentGame((err, g) => {
        g.p('score', 5150);
        g.save((err) => {
          game.generateNewRound((err, round) => {
            expect(round.level).to.equal(103);
            expect(round.data.name).to.deep.equal('lowlander');
            expect(round.data.clue).to.equal('_ _ _ _ _ _ _ _ _');
            done();
          });
        })
      });
    });
  });

  it('handles extremely large levels out of clue json bounds', (done) => {

    game.startNewRound(() => {
      game.currentGame((err, g) => {
        g.p('score', 55150);
        g.save((err) => {
          game.generateNewRound((err, round) => {
            expect(round.level).to.equal(1103);
            done();
          });
        })
      });
    });
  });
});