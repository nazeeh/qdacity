const os = require('os');

module.exports = os.hostname() + ':' + process.env.PORT + '@' + Date.now();
