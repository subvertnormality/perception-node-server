const _ = require('lodash');
const config = require('./config');
const passport = require('passport');
const TwitchtvStrategy = require('passport-twitchtv').Strategy;
const logger = require('./logger');

let db = require('./db');

const TWITCHTV_CLIENT_ID = config.twitterClientId;
const TWITCHTV_CLIENT_SECRET = config.twitterClientSecret;

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
      logger.info('No user exists currently, creating user in store: ', profile._json.name);
      user.save();
      return done(null, user);
    }
    
    user.load(ids[0], function (err, properties) {
      if (err) {
        // error path, fallback to updating with current twitch info
        logger.error(err, ' : User ID did not exist for username: ', profile._json.name);
        user.save();
        return done(null, user);
      } else {
        // save custom fields that Twitch don't provide
        user.prop('plays', properties.plays);
        user.prop('score', properties.score);
        user.prop('shame', properties.shame);
        user.prop('queueJobId', 0);
        user.prop('queueLastUpdate', 0);
        user.prop('socketId', 0);
        user.save();
        return done(null, user);
      }
    });
  });
}


function deserializeUser(name, done) {

  const user = db.factory('User');

  user.find({
    name: name
  }, function (err, ids) {
    if (_.isEmpty(ids) || err) {
      logger.error(err + ' : Error deserialising user. Ids: ' + ids);
      done(new Error('Could not deserialise user'));
    }
    user.load(ids[0], function (err, properties) {
      
      if (err) {
        logger.error(err + ' : Error loading user during deserialisation');
        return done(err);
      } else {
        logger.info('User successfully deserialised: ' + properties.name);
        return done(null, user);
      }
    });
  });

}

module.exports.passport = passport;
module.exports.deserializeUser = deserializeUser;
