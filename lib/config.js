const _ = require('lodash');

function fallbackRpcAddr() {
    let fallbackRpcAddr;

    if (process.env.ENV === 'dev' || process.env.ENV === 'prod') {
        fallbackRpcAddr = _.trim(require('child_process').execSync('head -1 ./ip.tmp || true'), '\n') + ':50051';
    } else {
        fallbackRpcAddr = '127.0.0.1:50051';
    }

    return fallbackRpcAddr;
}

const config = {
  addr: process.env.ADDR || 'http://dockerhost/',
  rpcAddr: process.env.RPC_ADDR || 
    process.env.DEV_RPC_ADDR || fallbackRpcAddr() || '',
  userInactivityTime: 10,
  turnSpeed: 60,
  twitterClientId: '1ng9wkkiow5ziwix0jxd5jee0e2d933',
  twitterClientSecret: '9l3vqptifoeg735qyvu8n5pabbjd3of'
};

module.exports = config;