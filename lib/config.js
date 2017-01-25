const path = require('path');
const Fs = require('fs');
const _ = require('lodash');

const config = {
  addr: process.env.ADDR || 'http://dockerhost/',
  secureAddr: process.env.SECUREADDR,
  rpcAddr: process.env.RPC_ADDR || '1.tcp.eu.ngrok.io:20187' || '',
  twitterClientId: '3u0xosz6y53wkn36pgqesorpqoiyci',
  twitterClientSecret: 'z7lmxvr0hltf6bwh74aa67j79qjsjb',
  publicCert: Fs.readFileSync(path.join(__dirname, '/../certs/ca.crt')),
  clientKey: Fs.readFileSync(path.join(__dirname, '/../certs/client.key')),
  clientCert: Fs.readFileSync(path.join(__dirname, '/../certs/client.crt')),
  userInactivityTime: 20,
  turnSpeed: 180,
  queueTimeoutTime: 60,
  gamePointWin: 1,
  gamePointLoss: -1,
  userPointWin: 1,
  userPointLoss: -1,
  shamePointWin: 1,
  shamePointLoss: -1
};

module.exports = config;