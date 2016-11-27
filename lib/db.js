const nohm = require('nohm').Nohm;
const redis = require('./redis');

require('./models/user')

redis.on('ready', () => nohm.setClient(redis));

module.exports = nohm;