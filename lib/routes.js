const queue = require('./queue');
const deserializeUser = require('./passport').deserializeUser;
const onlineStatus = require('./onlinestatus');
const game = require('./game');
const busy = require('./busy');
const config = require('./config');

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
            res.status(403).end();
          } else {

            user.p('queueLastUpdate', Date.now());
            user.save((err) => {
              if (!err) {
                res.send({
                  minutesLeftInQueue: queue.minutesLeftInQueue(user),
                  userDisplayName: user.p('displayName'),
                  userLogo: user.p('logo'),
                  systemStatus: onlineStatus()
                });
              } else {
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