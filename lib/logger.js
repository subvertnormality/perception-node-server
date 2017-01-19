const winston = require('winston');

const logger = new (winston.Logger)();

require('winston-loggly-bulk');
 
 logger.add(winston.transports.Loggly, {
    token: "1e0de515-9a83-4113-9c09-266981278085",
    subdomain: "andrewhillel",
    tags: ["Winston-NodeJS"],
    json:true
});

module.exports = logger;