const _ = require('lodash');
const fallbackRpcAddr;

if (process.env.ENV === 'dev' || process.env.ENV === 'prod') {
    fallbackRpcAddr = _.trim(require('child_process').execSync('head -1 ./ip.tmp || true'), '\n') + ':50051';
} else {
    fallbackRpcAddr = '127.0.0.1:50051';
}

const config = {
  addr: process.env.ADDR || 'http://dockerhost:3000/',
  rpcAddr: process.env.RPC_ADDR || 
    process.env.DEV_RPC_ADDR || fallbackRpcAddr || ''
};

module.exports = config;