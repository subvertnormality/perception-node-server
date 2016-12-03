const _ = require('lodash');
const config = require('./config');
const passport = require('passport');
const TwitchtvStrategy = require('passport-twitchtv').Strategy;
let db = require('./db');

const TWITCHTV_CLIENT_ID = '1ng9wkkiow5ziwix0jxd5jee0e2d933';
const TWITCHTV_CLIENT_SECRET = '9l3vqptifoeg735qyvu8n5pabbjd3of';

passport.serializeUser(function (user, done) {
  done(null, user.p('name'));
});

passport.deserializeUser(deserializeUser);

passport.use(new TwitchtvStrategy({
    clientID: TWITCHTV_CLIENT_ID,
    clientSecret: TWITCHTV_CLIENT_SECRET,
    callbackURL: config.addr + 'auth/callback',
    scope: 'user_read'
  },
  passportCallback
));

function passportCallback(accessToken, refreshToken, profile, done) {

  function updateTwitchUserFields(user, profile) {
    user.prop('name', profile._json.name);
    user.prop('displayName', profile._json.display_name);
    user.prop('email', profile._json.email);
    user.prop('logo', profile._json.logo);
  }

  var user = db.factory('User');

  user.find({
    name: profile._json.name
  }, function (err, ids) {

    updateTwitchUserFields(user, profile);
    // no user exists in our store
    if (err || _.isEmpty(ids)) {
      // update with current twitch info
      user.save();
      return done(null, user);
    }
    
    user.load(ids[0], function (err, properties) {
      if (err) {
        // error path, fallback to updating with current twitch info
        user.save();
        return done(null, user);
      } else {
        // save custom fields that Twitch don't provide
        user.prop('plays', properties.plays)
        user.save();
        return done(null, user);
      }
    });
  });
}


function deserializeUser(name, done) {

  var user = db.factory('User');

  user.find({
    name: name
  }, function (err, ids) {
    if (_.isEmpty(ids) || err) {
      done(new Error('Could not deserialise user'));
    }
    user.load(ids[0], function (err, properties) {
      
      if (err) {
        return done(err);
      } else {
        return done(null, user);
      }
    });
  });

}

module.exports = passport;
