const passport = require('passport');
const TwitchtvStrategy = require('passport-twitchtv').Strategy;

const TWITCHTV_CLIENT_ID = '1ng9wkkiow5ziwix0jxd5jee0e2d933';
const TWITCHTV_CLIENT_SECRET = '9l3vqptifoeg735qyvu8n5pabbjd3of';
const URL = process.env.ADDR || 'http://127.0.0.1:3000/';
console.log(URL)
// TODO: This isn't efficient. We should seialise the cached user ID
passport.serializeUser(function(user, done) {
  done(null, user);
});

// TODO: This isn't efficient. We should deseialise the cached user ID
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
console.log(URL + 'auth/callback')
passport.use(new TwitchtvStrategy({
    clientID: TWITCHTV_CLIENT_ID,
    clientSecret: TWITCHTV_CLIENT_SECRET,
    callbackURL: URL + 'auth/callback',
    scope: 'user_read'
  },
  function(accessToken, refreshToken, profile, done) {

    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // TODO: Return whole profile??
      return done(null, profile);
    });
  }
));

module.exports = passport;