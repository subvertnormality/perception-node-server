const queue = require('./queue');
const deserializeUser = require('./passport').deserializeUser;
const onlineStatus = require('./onlinestatus');
const game = require('./game');
const busy = require('./busy');
const async = require('async');
const db = require('./db');
const config = require('./config');
const logger = require('./logger');
const _ = require('lodash');

function configureRoutes(app, passport) {

  app.get('/', busy, function (req, res) {

    if (onlineStatus()) {
      res.render('online', {
        addr: config.addr,
        playTime: config.turnSpeed,
        timeoutTime: config.userInactivityTime
      });

    } else {
      res.render('offline', {
        addr: config.addr,
      });
    }
  });

  app.get('/scores', function (req, res) {
    game.currentRound((err, round) => {

      game.currentGame((err, g) => {

        let score = g.p('score');
        let shame = g.p('shame');

        res.render('score', {
          layout: 'arenascreen.handlebars',
          addr: config.addr,
          level: round.level,
          score: score,
          shame: shame
        });
      })
    });

  });

  app.get('/highscores', function (req, res) {

    const user = db.factory('User');

    const allUsers = [];

    user.find(function (err, ids) {

      async.eachSeries(ids, (id, cb) => {
        user.load(id, function (err, properties) {
          if (err) {
            cb(err);
          } else {
            allUsers.push(properties);
            cb(null, true);
          }
        });
      }, (err, result) => {
        if (err) {
          logger.error(err + ' Error loading highscores');
          res.render('highscores');
        } else {

          const highScoringUsers = _.take(_.reverse(_.sortBy(allUsers, 'score')), 5);

          res.render('highscores', {
            layout: 'arenascreen.handlebars',
            addr: config.addr,
            highScoringUsers: highScoringUsers
          });
        }
      })
    });

  });


  app.get('/playerinfo', function (req, res) {
    queue.currentlyPlayingUser((err, user) => {
      if (!err) {
        let userDisplayName = user.p('displayName');
        let userScore = user.p('score');
        let userShame = user.p('shame');

        res.render('player', {
          layout: 'arenascreen.handlebars',
          addr: config.addr,
          userDisplayName: userDisplayName,
          score: userScore,
          shame: userShame
        });
      } else {
        res.render('player', {
          layout: 'arenascreen.handlebars',
          addr: config.addr,
          userDisplayName: null,
          score: null,
          shame: null
        });
      }

    });

  });

  app.get('/auth', 
    passport.authenticate('twitchtv', { scope: ['user_read'] }),
    function (req, res) { }
  );

  app.get('/auth/callback',
    passport.authenticate('twitchtv', { failureRedirect: '/login' }),
    function (req, res) {
      res.redirect('/');
    }
  );

  app.get('/logout', busy, function (req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get('/queue/user/', busy, function (req, res) {
    const sess = req.session;

    if (!sess) {
      res.status(403).end();
    } else {
      if (sess.passport && sess.passport.user) {
        deserializeUser(sess.passport.user, (err, user) => {
          if (err || !user) {
            logger.error(err + ' Error loading user queue info');
            res.status(403).end();
          } else {

            user.p('queueLastUpdate', Date.now());
            user.save((err) => {
              if (!err) {
                res.send({
                  minutesLeftInQueue: queue.minutesLeftInQueue(user),
                  userDisplayName: user.p('displayName'),
                  userLogo: user.p('logo'),
                  systemStatus: onlineStatus(),
                  gamePlayerType: queue.currentPlayerMode()
                });
              } else {
                logger.error('Error saving use on queue info ' + err);
                res.status(503).end();
              }
            });
          }
        });
      } else {
        res.status(403).end();
      }
    }

  });

  app.get('/queue/currentlyplaying/', busy, function (req, res) {
    const sess = req.session;

    if (!sess) {
      res.status(403).end();
    } else {
      if (sess.passport && sess.passport.user) {

        queue.currentlyPlayingUser((err, currentlyPlayingUser) => {
          if (err) {
            logger.error('Error getting currently playing info : ' + err);
            res.status(403).end();
          } else {
            res.send(
              {
                displayName: currentlyPlayingUser.p('displayName'),
                logo: currentlyPlayingUser.p('logo'),
                plays: currentlyPlayingUser.p('plays')
              }
            );
          }
        });

      } else {
        res.status(403).end();
      }
    }

  });
}

module.exports = configureRoutes;