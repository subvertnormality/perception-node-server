const queue = require('./queue');
const game = require('./game');
const score = require('./score');
const config = require('./config');

function configureGameRoutes(app) {

  app.post('/game/scorepoints/', function (req, res) {
    score.processScore(game.currentGame, 'score', config.gamePointWin, (err) => {
      if (err) {
        res.status(500).end();
      } else {
        res.status(202).end();  
      }
    });
  });

  app.post('/game/losepoints/', function (req, res) {
    score.processScore(game.currentGame, 'score', config.gamePointLoss, (err) => {
      if (err) {
        res.status(500).end();
      } else {
        res.status(202).end();  
      }
    });
  });

  app.post('/game/scoreshame/', function (req, res) {
    score.processScore(game.currentGame, 'shame', config.shamePointWin, (err) => {
      if (err) {
        res.status(500).end();
      } else {
        res.status(202).end();  
      }
    });
  });

  app.post('/game/loseshame/', function (req, res) {
    score.processScore(game.currentGame, 'shame', config.shamePointLoss, (err) => {
      if (err) {
        res.status(500).end();
      } else {
        res.status(202).end();  
      }
    });
  });

  app.post('/game/user/scorepoints/', function (req, res) {

    score.processScore(queue.currentlyPlayingUser, 'score', config.userPointWin, (err) => {
      if (err) {
        res.status(500).end();
      } else {
        res.status(202).end();  
      }
    });
  });

  app.post('/game/user/losepoints/', function (req, res) {

    score.processScore(queue.currentlyPlayingUser, 'score', config.userPointLoss, (err) => {
      if (err) {
        res.status(500).end();
      } else {
        res.status(202).end();  
      }
    });
  });

  app.post('/game/user/scoreshame/', function (req, res) {

    score.processScore(queue.currentlyPlayingUser, 'shame', config.shamePointWin, (err) => {
      if (err) {
        res.status(500).end();
      } else {
        res.status(202).end();  
      }
    });
  });

  app.post('/game/user/loseshame/', function (req, res) {

    score.processScore(queue.currentlyPlayingUser, 'shame', config.shamePointLoss, (err) => {
      if (err) {
        res.status(500).end();
      } else {
        res.status(202).end();  
      }
    });
  });

}

module.exports = configureGameRoutes;