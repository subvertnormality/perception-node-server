const tmi = require('tmi.js');
const config = require('./config');
const game = require('./game')
const _ = require('lodash');

const sslCreds = grpc.credentials.createSsl(
  config.publicCert,
  config.clientKey,
  config.clientCert
);

const rpcStub = new control.Control(config.rpcAddr, sslCreds);

const messageBatch = [];

const commandMap = {
  'forwards': 87,
  'backwards': 83,
  'left': 63,
  'right': 68,
  'pickup': 84,
  'putdown': 71,
  'lookup': 82,
  'lookdown': 70
};

const options = {
  options: {
    debug: true
  },
  connection: {
    reconnect: true
  },
  identity: {
    username: 'PerceptionBot',
    password: 'oauth:3qdbm6yq7jdh5vqvsvzx7ys9ic08fp'
  },
  channels: ['playperception']
};

const client = new tmi.client(options);

client.connect();

client.on('chat', (channel, userstate, message, self) => messageBatch.push(message));

const messageParser = setInterval(function () {

  let counts = _(messageBatch)
    .map((message) => _.lowerCase(_.trim(message)))
    .countBy()
    .keys()
    .value();

  winner = Object.keys(counts).reduce((a, b) => { return counts[a] > counts[b] ? a : b });

  if (game.currentPlayerMode() == 'twitch') {
    processCommand(winner);
  }

  messageBatch.length = 0;

}, 5000);

function processCommand(command) {
  const sanitisedCommand = _.trim(_.lowerCase(command));
  const keyCode = commandMap[sanitisedCommand];

  if (keyCode) {
    const payload = {
      'key_code': keyCode,
      'is_shift_down': 1, 
      'is_ctrl_down': 0, 
      'is_alt_down': 0, 
      'is_key_down': 0
    }
    setTimeout(() => {
      const stopPayload = _.clone(payload);
      stopPayload['is_key_down'] = 1;
      rpcStub.handleKeyEvent(stopPayload, (error, res) => {});
    }, 1000)
    rpcStub.handleKeyEvent(payload, (error, res) => {});
  } else if (_.startsWith(sanitisedCommand, 'say ')) {
    const textToSay = _.trimStart(sanitisedCommand, 'say ');
    rpcStub.handleSayTextEvent(textToSay, (error, res) => {})
  }
}

