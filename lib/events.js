const EventEmitter = require('events');

const userEvents = new EventEmitter();
userEvents.setMaxListeners(1);

module.exports.userEvents = userEvents;