const Socket = require('./Socket.js');
const Logger = require('../utils/Logger.js');

// Listen for new socket connections and hand off to new Socket objects
module.exports = (io, redis) => {
  io.on('connection', socket => {
	Logger.info(`${socket.id} connected`);
    new Socket(io, socket, redis);
  });
};
