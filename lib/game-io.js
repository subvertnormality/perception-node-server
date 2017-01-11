const userEvents = require('./events').userEvents;
const config = require('./config');
const _ = require('lodash');

function init(io, securityHash) {

  const gameUi = io.of('/gameUi');

  gameUi.use(function(socket, next) {
    const handshakeData = socket.request;
    if (_.includes(handshakeData._query['sechash'], securityHash)) {
      return next();
    }
    next(new Error('Authentication error'));
  });

  gameUi.on('connection', function (socket) {
    userEvents.on('reload_ui', () => {
      socket.emit('reload');
    });
  });

}

module.exports = init;