const path = require('path');
const Fs = require('fs');
const _ = require('lodash');

const config = {
  addr: process.env.ADDR || 'http://dockerhost/',
  rpcAddr: process.env.RPC_ADDR || '1.tcp.eu.ngrok.io:20187' || '',
  twitterClientId: '1ng9wkkiow5ziwix0jxd5jee0e2d933',
  twitterClientSecret: '9l3vqptifoeg735qyvu8n5pabbjd3of',
  publicCert: Fs.readFileSync(path.join(__dirname, '/../certs/ca.crt')),
  clientKey: Fs.readFileSync(path.join(__dirname, '/../certs/client.key')),
  clientCert: Fs.readFileSync(path.join(__dirname, '/../certs/client.crt')),
  userInactivityTime: 10,
  turnSpeed: 60,
  queueTimeoutTime: 3 * 60,
  gamePointWin: 1,
  gamePointLoss: -50,
  userPointWin: 1,
  userPointLoss: -1,
  shamePointWin: 1,
  shamePointLoss: -1
};

module.exports = config;