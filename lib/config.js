const _ = require('lodash');

if (process.env.ENV === 'dev' || process.env.ENV === 'prod') {
    client = require('redis').createClient({host: 'redis'});
} else {
    client = require('fakeredis').createClient();
}

const config = {
  addr: process.env.ADDR || 'http://dockerhost:3000/',
  rpcAddr: process.env.RPC_ADDR || 
    process.env.DEV_RPC_ADDR ||
    _.trim(require('child_process').execSync('head -1 ./ip.tmp || true'), '\n') + ':50051' ||
    ''
};

module.exports = config;