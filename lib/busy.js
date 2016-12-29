const toobusy = require('toobusy-js');

const busy = function(req, res, next) {
  if (toobusy()) {
    res.send(503);
  } else {
    next();
  } 
};

module.exports = busy;