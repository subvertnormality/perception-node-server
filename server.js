const express = require('express');
const expressSession = require('express-session');
const expressCookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const RedisStore = require('connect-redis')(expressSession);
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {path: '/socket.io'});
const initIo = require('./lib/io');
const initGameIo = require('./lib/game-io')
const routes = require('./lib/routes');
const gameRoutes = require('./lib/game-routes');
const passport = require('./lib/passport').passport;
const redis = require('./lib/redis');
const expressHbs  = require('express-handlebars');
const crypto = require('crypto');

const STORE_SECRET = 'Fjnewvi!£wei2847!jfaefb38DJFB09W';
const SECURTY_HASH = crypto.randomBytes(16).toString('hex');

redis.on('ready', () => {

  const redisStore = new RedisStore({
    client: redis
  });

  const sessionSettings = {
      cookieParser: expressCookieParser,
      key:         'perception.sid',
      secret:      STORE_SECRET,
      store:       redisStore,
  };

  app.engine('handlebars', expressHbs({defaultLayout: 'main'}));
  app.set('view engine', 'handlebars');
  app.use(express.static('public'))
  app.use(expressCookieParser());
  app.use(expressSession(sessionSettings));
  app.use(bodyParser.json());
  app.use(passport.initialize());
  app.use(passport.session());

  routes(app, passport);
  gameRoutes(app, SECURTY_HASH);

  initIo(io, sessionSettings);
  initGameIo(io, SECURTY_HASH);

  http.listen(3000, function () {
    console.log('Listening on port 3000')
  });

});
