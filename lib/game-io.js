const userEvents = require('./events').userEvents;
const _ = require('lodash');

function init(io, securityHash) {

  const gameUi = io.of('/gameUi');

  gameUi.use(function(socket, next) {

    if (_.includes(socket.request.headers.cookie, securityHash)) {
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