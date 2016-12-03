const queue = require('./queue');
const deserializeUser = require('./passport').deserializeUser;

function configureRoutes(app, passport) {

  app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
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

  app.get('/queue/minutesleft/', function (req, res) {
    const sess = req.session;

    if (!sess) {
      res.status(403).end();
    } else {
      if (sess.passport && sess.passport.user) {
        deserializeUser(sess.passport.user, (err, user) => {
          if (err || !user) {
            res.status(403).end();
          } else {
            res.send({minutesLeftInQueue: queue.minutesLeftInQueue(user)});
          }
        });
      } else {
        res.status(403).end();
      }
    }

  });
}

module.exports = configureRoutes;