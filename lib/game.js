const _ = require('lodash');
const db = require('./db');
const config = require('./config');
const score = require('./score');
const queue = require('./queue');
const levels = require('./game/levels.json');
const logger = require('./logger');

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
    if (err) {
      logger.error(err + ' : Error fetching current game in games played');
      done();
    }
    g.p('plays', g.p('plays') + 1);
    g.save((err) => {
      done();
    });
  });
}

function spacesInClue(level) {

  if (level < 1) {
    return 1;
  }
  if (level >= 1 && level < 5) {
    return 2;
  }
  if (level >= 5 && level < 10) {
    return 3;
  }
  if (level >= 10 && level < 20) {
    return 4;
  }
  if (level >= 20 && level < 40) {
    return 5;
  }
  if (level >= 40 && level < 60) {
    return 6;
  }
  if (level >= 60 && level < 80) {
    return 7;
  }
  if (level >= 80 && level < 100) {
    return 8;
  }
  if (level >= 100 && level < 120) {
    return 9;
  }
  return 10;
}

function generateClue(word, level) {

  const numberOfSpaces = spacesInClue(level);
  let letterIndexes = [];

  for (var i = 0; i < word.length; i++) {
    letterIndexes.push(i);
  }

  const numberOfLetters = word.length - numberOfSpaces > -1 ? word.length - numberOfSpaces : 0;
  const lettersToReveal = _.take(_.shuffle(letterIndexes), numberOfLetters);
  let clue = '';
  _.forEach(word, (letter, index) => {
    if (_.includes(lettersToReveal, index)) {
      clue = clue + letter + ' ';
    } else {
      clue = clue + '_ ';
    }
  });
  return _.trimEnd(clue, ' ');
}

function generateNewRound(done) {

  currentGame((err, g) => {
    const score = g.p('score');
    const level = Math.floor(score / 50);
    const locations = {
      configuration: [1, 2, 3, 0, 0, 0],
      level: level
    };
    const computedLevel = level <= levels.length ? level : _.random(0, levels.length);
    locations.configuration = _.shuffle(locations.configuration)
    locations.data = levels[computedLevel][_.random(0, 49)];
    locations.data.complete = false;
    locations.data.clue = generateClue(locations.data.name, level);
    done(err, locations);
  });

}

function startNewRound(done) {
  currentGame((err, g) => {
    generateNewRound((err, round) => {
      g.p('round', round);
      g.save((err) => {
        done(err, true);
      });
    });
  });
}

function currentRound(done) {
  currentGame((err, g) => {
    done(err, g.p('round'));
  });
}

function checkWin(attempt, done) {
  currentGame((err, g) => {
    if (_.isEqual(attempt, g.p('round').configuration)) {
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

function skipRound(done) {
  score.processScore(currentGame, 'shame', 1, (err) => {
    startNewRound(done)

  });
}

function playRound(attempt, done) {
  checkWin(attempt, (err, win) => {
    if (win) {
      winRound(done);
    } else {
      done(err, false)
    }
  })
}

function attemptUnlockRound(attempt, done) {

  currentGame((err, g) => {
    const round = g.p('round');

    if (round.data.name == attempt) {
      round.data.complete = true;
      g.p('round', round);
      g.save((err) =>{
        done(err, true);
      });
    } else {
      done(err, false);
    }

  });

}

module.exports.currentGame = currentGame;
module.exports.incrementGamesPlayed = incrementGamesPlayed;
module.exports.generateNewRound = generateNewRound;
module.exports.startNewRound = startNewRound;
module.exports.currentRound = currentRound;
module.exports.checkWin = checkWin;
module.exports.winRound = winRound;
module.exports.playRound = playRound;
module.exports.skipRound = skipRound;
module.exports.attemptUnlockRound = attemptUnlockRound;