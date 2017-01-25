const tmi = require('tmi.js');
const config = require('./config');
const game = require('./game');
const queue = require('./queue');
const grpc = require('grpc');
const control = grpc.load(__dirname + '/protos/control.proto').control;
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
  'left': 65,
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

  const counts = _(messageBatch)
    .map((message) => _.lowerCase(_.trim(message)))
    .countBy()
    .keys()
    .value();

  const winner = !_.isEmpty(Object.keys(counts)) ? 
    Object.keys(counts).reduce((a, b) => { return counts[a] > counts[b] ? a : b }) :
    false;
  console.log('currently play mode')
  console.log(queue.currentGamePlayerMode())
  if (counts[winner] && queue.currentGamePlayerMode() == 'twitch') {
    processCommand(counts[winner]);
  }

  messageBatch.length = 0;

}, 5000);

function processCommand(command) {
  console.log('command', command)
  const sanitisedCommand = _.trim(_.lowerCase(command));
  const keyCode = commandMap[sanitisedCommand];

  if (keyCode) {
    const payload = {
      'key_code': keyCode,
      'is_shift_down': 1, 
      'is_ctrl_down': 0, 
      'is_alt_down': 0, 
      'is_key_down': true
    }
    setTimeout(() => {
      const stopPayload = _.clone(payload);
      stopPayload['is_key_down'] = false;
      rpcStub.handleKeyEvent(stopPayload, (error, res) => {});
      console.log('Sending stop payload: ', stopPayload);
    }, 1000)
    console.log('Sending payload: ', payload);
    rpcStub.handleKeyEvent(payload, (error, res) => {});
  } else if (_.startsWith(sanitisedCommand, 'say ')) {
    const textToSay = {'text': _.trimStart(sanitisedCommand, 'say ')};
    console.log('Sending say payload: ', textToSay)
    rpcStub.handleSayTextEvent(textToSay, (error, res) => {})
  }
}

