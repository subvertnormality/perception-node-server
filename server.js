const express = require('express');
const expressSession = require('express-session');
const expressCookieParser = require('cookie-parser');
const RedisStore = require('connect-redis')(expressSession);
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const initIo = require('./lib/io');
const routes = require('./lib/routes');
const passport = require('./lib/passport').passport;
const redis = require('./lib/redis');

const STORE_SECRET = 'Fjnewvi!£wei2847!jfaefb38DJFB09W';

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


  app.use(express.static('public'))
  app.use(expressCookieParser());
  app.use(expressSession(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  routes(app, passport);

  initIo(io, sessionSettings);

  http.listen(3000, function () {
    console.log('Listening on port 3000')
  });

});