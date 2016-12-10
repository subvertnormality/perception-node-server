const config = require('./config');
const grpc = require('grpc');
const control = grpc.load(__dirname + '/protos/control.proto').control;
const rpcStub = new control.Control(config.rpcAddr, grpc.credentials.createInsecure());

// TODO: store this in redis
let online = false;

function checkOnline() {

  rpcStub.handleImageGetEvent({}, function (error, img) {

    if (!img || error) {
      online = false;
      return;
    }

    online = true;
    return;
  });
}

function getOnlineStatus() {
  return online;
}

checkOnline();
setInterval(() => { checkOnline(); }, 1000 * 5 );

module.exports = getOnlineStatus;