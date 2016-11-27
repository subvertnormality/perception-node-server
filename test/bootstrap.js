const appRoot = require('app-root-path');
const redis = require(appRoot + '/lib/redis');

before(function(done) {
  redis.on('ready', done);
});

