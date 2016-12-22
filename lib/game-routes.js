const queue = require('./queue');
const game = require('./game');
const score = require('./score');
const config = require('./config');
const _ = require('lodash');


function configureGameRoutes(app) {

  app.get('/game/ui/', function (req, res) {

    let classes = ['','','','','',''];

    game.currentRound((err, round) => {

      _.forEach(round, (item, index) => {
        if (item != 0) {
          let c;
          switch (item){
            case 1:
              c = 'arone';
              break;
            case 2:
              c = 'artwo';
              break;
            case 3:
              c = 'arthree';
              break;
          }
          classes[index] = c;
        }
      });


      res.render('arenablocks', {
        layout: 'arenascreen.handlebars',
        oneClasses: classes[0],
        twoClasses: classes[1],
        threeClasses: classes[2],
        fourClasses: classes[3],
        fiveClasses: classes[4],
        sixClasses: classes[5]
      });
    })
  });

  app.post('/game/playround/', function (req, res) {
    if (req.body && _.isArray(req.body)) {
      game.playRound(req.body, (err, result) => {
        if (err || !result) {
          res.status(202).send({win: false});
        } else {
          res.status(202).send({win: true});
        }
      });
    } else {
      res.status(503).end('Needs to be sent an array');
    }

  });

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