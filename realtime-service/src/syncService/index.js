const Socket = require('./Socket.js');

// Listen for new socket connections and hand off to new Socket objects
module.exports = (io, redis) => {
  io.on('connection', socket => {
    console.info(`${socket.id} connected`);

    new Socket(io, socket, redis);
  });
};
