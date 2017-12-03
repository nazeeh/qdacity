/**
 * SyncService entry point
 *
 * socket.io provides "rooms", i.e. channels/groups of sockets. Here one room
 * is used per document (identified by the document id). This makes it easy
 * to broadcast any changes regarding a document to its room.
 */

const SERVER_NAME = require('../utils/serverName');

// redis instance, injected from outside
let redis;

// socket.io instance, injected from outside
let io;

/**
 * Notify all sockets that watch a specific document, that the user list on
 * that document changed
 */
const emitUserChange = docid => {
  // Get all sockets in the document room. `clients` contains the socket ids
  io.in(docid).clients((error, clients) => {

    // Get data for those clients to match additional data
    redis.hmget(['socketdata'].concat(clients), (err, res) => {

      // Augment socket ids with data from shared application state
      const data = res ? res.map(json => JSON.parse(json).data) : [];

      // Broadcast message "user_change" to document room
      io.to(docid).emit(
        'user_change',
        data
      );
    });
  });
};

/**
 * Creator for listener to be called on logon message
 */
const onLogon = socket => (data, cb) => {
  console.info(`user ${socket.id} logged on with ${JSON.stringify(data)}`);

  // Add socket and its data to shared application state
  redis.hset([
    'socketdata',
    socket.id,
    JSON.stringify({
      data,
      server: SERVER_NAME,
    }),
  ]);

  // Call callback if defined
  if (cb) {
    cb();
  }

  // Notify all sockets that share a room with the new socket
  Object.keys(socket.rooms).map(docid => emitUserChange(docid));
};

/**
 * Creator for listener to be called on use_enter message
 */
const onUserEnter = socket => docid => addSocketToDocument(socket, docid);

/**
 * Creator for listener to be called on user_leave message
 */
const onUserLeave = socket => docid => removeSocketFromDocument(socket, docid);

/**
 * Remove socket from document and notify all other sockets on the same doc
 */
const removeSocketFromDocument = (socket, docid) => {
  socket.leave(docid);
  emitUserChange(docid);
};

/**
 * Add socket to document room, notify other sockets in room
 */
const addSocketToDocument = (socket, docid) => {
  socket.join(docid);
  emitUserChange(docid);
};

/**
 * Creator for listener to be called right before a socket disconnects
 */
const onSocketDisconnecting = socket => () => {
  // Remove socket data from shared application state
  redis.hdel('socketdata', socket.id);

  // Loop over socket's rooms/documents and remove socket from each
  Object.keys(socket.rooms).map(docid => {
    removeSocketFromDocument(socket, docid);
  });

  console.info(`user ${socket.id} disconnected`);
};

/**
 * Initialize SyncService
 */
module.exports = (_io, _redis) => {
  io = _io;
  redis = _redis;

  io.on('connection', socket => {
    console.info(`user ${socket.id} connected`);

    socket.emit('welcome', SERVER_NAME);

    socket.on('logon', onLogon(socket));
    socket.on('documentEnter', onUserEnter(socket));
    socket.on('documentLeave', onUserLeave(socket));
    socket.on('disconnecting', onSocketDisconnecting(socket));
  });
};
