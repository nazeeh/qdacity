const SERVER_NAME = require('../utils/serverName');

/**
 * class SyncService
 *
 * socket.io provides "rooms", i.e. channels/groups of sockets. Here one room
 * is used per document (identified by the document id). This makes it easy
 * to broadcast any changes regarding a document to its room.
 */
class SyncService {

  /**
   * SyncService constructor
   */
  constructor(io, redis) {
    this.io = io;
    this.redis = redis;

    io.on('connection', socket => {
      console.info(`user ${socket.id} connected`);

      socket.emit('welcome', SERVER_NAME);

      socket.on(
        'logon',
        data => this._handleSocketLogon(socket, data)
      );
      socket.on(
        'documentEnter',
        docid => this._addSocketToDocument(socket, docid)
      );
      socket.on(
        'documentLeave',
        docid => this._removeSocketFromDocument(socket, docid)
      );
      socket.on('disconnecting', () => this._handleSocketDisconnecting(socket));
    });
  }

  /**
   * Handle socket logon
   */
  _handleSocketLogon(socket, data) {
    console.info(`user ${socket.id} logged on with ${JSON.stringify(data)}`);

    // Add socket and its data to shared application state
    this.redis.hset([
      'socketdata',
      socket.id,
      JSON.stringify({
        data,
        server: SERVER_NAME,
      }),
    ]);

    // Notify all sockets that share a room with the new socket
    Object.keys(socket.rooms).map(docid => this._emitUserChange(docid));
  };


  /**
   * Add socket to document room, notify other sockets in room
   */
  _addSocketToDocument(socket, docid) {
    socket.join(docid);
    this._emitUserChange(docid);
  }

  /**
   * Remove socket from document and notify all other sockets on the same doc
   */
  _removeSocketFromDocument(socket, docid) {
    socket.leave(docid);
    this._emitUserChange(docid);
  };

  /**
   * Handle disconnection of sockets
   */
  _handleSocketDisconnecting(socket) {
    // Remove socket data from shared application state
    this.redis.hdel('socketdata', socket.id);

    // Loop over socket's rooms/documents and remove socket from each
    Object.keys(socket.rooms).map(docid => {
      this._removeSocketFromDocument(socket, docid);
    });

    console.info(`user ${socket.id} disconnected`);
  };

  /**
   * Notify all sockets that watch a specific document, that the user list on
   * that document changed
   */
  _emitUserChange(docid) {

    // Get all sockets in the document room. `clients` contains the socket ids
    this.io.in(docid).clients((error, clients) => {

      const redisArgs = ['socketdata'].concat(clients);

      // Get data for those clients to match additional data
      this.redis.hmget(redisArgs, (err, res) => {

        // Return empty array if anything goes wrong
        let data = [];

        // Only read data if res is truthy
        if (res) {
          // Map res array to data field if present, or fallback to {}
          data = res
            .map(clientData => JSON.parse(clientData))
            .map(json => json.data || {});
        }

        // Broadcast message "user_change" to document room
        this.io.to(docid).emit(
          'user_change',
          data
        );
      });
    });
  };

}

/**
 * Create and return new SyncService instance
 */
module.exports = (io, redis) => {
  return new SyncService(io, redis);
};
