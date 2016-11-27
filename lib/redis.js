const client = require('redis').createClient({host: 'redis'});

module.exports = client;