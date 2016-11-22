
var os = require('os');
var util = require('util');
var ifaces = os.networkInterfaces();

for (var dev in ifaces) {
  if (ifaces.hasOwnProperty(dev)) {
    for (var i = 0, len = ifaces[dev].length; i < len; i++) {
      var details = ifaces[dev][i];
      if (details.family === 'IPv4') {
        console.log(details.address);
        break;
      }
    }
    break;
  }
}