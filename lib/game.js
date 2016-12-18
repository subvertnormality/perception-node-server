const _ = require('lodash');
const db = require('./db');
const config = require('./config');
const score = require('./score');
const queue = require('./queue');

function currentGame(done) {

  const game = db.factory('Game');

  game.find({
    name: 'perception'
  }, function (err, ids) {
    if (_.isEmpty(ids) || err) {
      game.p('name', 'perception');
      game.save((err) => {
        done(err, game);
        return;
      });
    } else {
      game.load(ids[0], function (err, properties) {
        game.save((err) => {
          done(err, game);
          return;
        });
      });
    }
  });
}

function incrementGamesPlayed(done) {
  currentGame((err, g) => {
    g.p('plays', g.p('plays') + 1);
    g.save((err) => {
      done();
    });
  });
}

function generateNewRound() {
  const locations = [1, 2, 3, 0, 0, 0];
  return _.shuffle(locations);
}

function startNewRound(done) {
  currentGame((err, g) => {
    g.p('round', generateNewRound());
    g.save((err) => {
      done(err, true);
    });
  });
}

function checkWin(attempt, done) {

  currentGame((err, g) => {
    if (_.isEqual(attempt, g.p('round'))) {
      done(err, true);
    } else {
      done(err, false);
    }
  });
}

function winRound(done) {
  score.processScore(currentGame, 'score', config.gamePointWin, (err) => {
    score.processScore(queue.currentlyPlayingUser, 'score', config.userPointWin, (err) => {
      startNewRound(done)
    });
  });
}

module.exports.currentGame = currentGame;
module.exports.incrementGamesPlayed = incrementGamesPlayed;
module.exports.generateNewRound = generateNewRound;
module.exports.startNewRound = startNewRound;
module.exports.checkWin = checkWin;
module.exports.winRound = winRound;