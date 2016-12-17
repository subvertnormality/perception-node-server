const nohm = require('nohm').Nohm;
const redis = require('./redis');

require('./models/user');
require('./models/game');

redis.on('ready', () => nohm.setClient(redis));

module.exports = nohm;