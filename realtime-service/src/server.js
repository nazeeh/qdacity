/**
 * Server entry point. Should be imported by ../index.js
 */

const SERVER_NAME = require('./utils/serverName');

// Socket.io setup as suggested in https://socket.io/get-started/chat/
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  // Additionally restrict transport protocol to long-polling, since Google App
  // Engine does not support WebSockets
  'transports': ['polling'],
});

// Setup Redis connection
const redis = require('./redis')(io);

// Setup sync service
require('./syncService')(io, redis);

// Setup file server for non-websocket content
require('./fileServer')(app);

// Start server and listen on all IPs
http.listen(process.env.PORT, '0.0.0.0', () => {
  console.info(`${SERVER_NAME} listening`);
});
