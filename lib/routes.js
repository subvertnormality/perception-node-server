const queue = require('./queue');
const deserializeUser = require('./passport').deserializeUser;
const onlineStatus = require('./onlinestatus');

function configureRoutes(app, passport) {

  app.get('/', function (req, res) {

    if (onlineStatus()) {
      res.render('online');

    } else {
      res.render('offline');
    }
  });

  app.get('/currentCozmoImage', function (req, res) {
    rpcStub.handleImageGetEvent({}, function (error, img) {
      res.end(img.image, 'binary');
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

  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get('/queue/user/', function (req, res) {
    const sess = req.session;

    if (!sess) {
      res.status(403).end();
    } else {
      if (sess.passport && sess.passport.user) {
        deserializeUser(sess.passport.user, (err, user) => {
          if (err || !user) {
            res.status(403).end();
          } else {
            res.send({
              minutesLeftInQueue: queue.minutesLeftInQueue(user),
              userDisplayName: user.p('displayName'),
              userLogo: user.p('logo')
            });
          }
        });
      } else {
        res.status(403).end();
      }
    }

  });

  app.get('/queue/currentlyplaying/', function (req, res) {
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