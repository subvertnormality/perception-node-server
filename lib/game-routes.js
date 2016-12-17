const queue = require('./queue');
const game = require('./game');
const config = require('./config');

function processScore(accessFunc, scoreType, amount, done) {
  accessFunc((err, scoreContainer) => {
    if (err) {
      done(err);
    }

    let finalAmount;

    scoreContainer.p(scoreType) + amount < 0 ? finalAmount = 0 : finalAmount = amount;
    scoreContainer.p(scoreType, scoreContainer.p(scoreType) + finalAmount);
    
    scoreContainer.save((err) => {
      if (!err) {
        done(null);   
      } else {
        done(err);
      }
    });
  });
}

function configureGameRoutes(app) {

  app.post('/game/scorepoints/', function (req, res) {
    processScore(game.currentGame, 'score', config.gamePointWin, (err) => {
      if (err) {
        res.status(500).end();
      } else {
        res.status(202).end();  
      }
    });
  });

  app.post('/game/losepoints/', function (req, res) {
    processScore(game.currentGame, 'score', config.gamePointLoss, (err) => {
      if (err) {
        res.status(500).end();
      } else {
        res.status(202).end();  
      }
    });
  });

  app.post('/game/scoreshame/', function (req, res) {
    processScore(game.currentGame, 'shame', config.shamePointWin, (err) => {
      if (err) {
        res.status(500).end();
      } else {
        res.status(202).end();  
      }
    });
  });

  app.post('/game/loseshame/', function (req, res) {
    processScore(game.currentGame, 'shame', config.shamePointLoss, (err) => {
      if (err) {
        res.status(500).end();
      } else {
        res.status(202).end();  
      }
    });
  });

  app.post('/game/user/scorepoints/', function (req, res) {

    processScore(queue.currentlyPlayingUser, 'score', config.userPointWin, (err) => {
      if (err) {
        res.status(500).end();
      } else {
        res.status(202).end();  
      }
    });
  });

  app.post('/game/user/losepoints/', function (req, res) {

    processScore(queue.currentlyPlayingUser, 'score', config.userPointLoss, (err) => {
      if (err) {
        res.status(500).end();
      } else {
        res.status(202).end();  
      }
    });
  });

  app.post('/game/user/scoreshame/', function (req, res) {

    processScore(queue.currentlyPlayingUser, 'shame', config.shamePointWin, (err) => {
      if (err) {
        res.status(500).end();
      } else {
        res.status(202).end();  
      }
    });
  });

  app.post('/game/user/loseshame/', function (req, res) {

    processScore(queue.currentlyPlayingUser, 'shame', config.shamePointLoss, (err) => {
      if (err) {
        res.status(500).end();
      } else {
        res.status(202).end();  
      }
    });
  });

}

module.exports = configureGameRoutes;