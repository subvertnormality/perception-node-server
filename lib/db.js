const nohm = require('nohm').Nohm;
const redis = require('./redis');

require('./models/user')

nohm.setClient(redis);

module.exports = nohm;