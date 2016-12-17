const _ = require('lodash');
let db = require('./db');

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
  currentGame((err, game) => {
    game.p('plays', game.p('plays') + 1);
    game.save((err) => {
      done();
    });
  });
}

module.exports.currentGame = currentGame;
module.exports.incrementGamesPlayed = incrementGamesPlayed;