
// token oauth:3qdbm6yq7jdh5vqvsvzx7ys9ic08fp
const tmi = require('tmi.js');
const _ = require('lodash');

const messageBatch = [];

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

// Connect the client to the server..
client.connect();

client.on('chat', (channel, userstate, message, self) => {
    console.log(self)
    console.log(':')
    console.log(message);
    messageBatch.push(message);
});


const messageParser = setInterval(function() {

    let counts = _(messageBatch)
    .map((message) => _.lowerCase(_.trim(message)))
    .countBy()
    .keys()
    .value();
    
    winner = Object.keys(counts).reduce((a, b) => { return counts[a] > counts[b] ? a : b });
    

    console.log(winner);


    // Object.keys(countsobj).reduce((a, b) => {obj[a] > obj[b] ? a : b });


    messageBatch.length = 0;

}, 5000);

