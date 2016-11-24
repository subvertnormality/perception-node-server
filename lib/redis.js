var client;

if (process.env.ENV === 'dev' || process.env.ENV === 'prod') {
    client = require('redis').createClient({host: 'redis'});
} else {
    client = require('fakeredis').createClient();
}


module.exports = client;