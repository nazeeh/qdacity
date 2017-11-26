if (!process.env.PORT) {
  process.env.PORT = 8080;
}

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const redis = require('./redis')(io);
require('./syncService')(io, redis);
require('./fileServer')(app);

http.listen(process.env.PORT, '0.0.0.0', () => {
  console.info(`App listening on port ${process.env.PORT}`);
});
