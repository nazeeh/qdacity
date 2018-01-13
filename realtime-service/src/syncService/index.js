const SERVER_NAME = require('../utils/serverName');

// Message and event constants
const { MSG, EVT } = require('./constants.js');

// Key to use for socket data hash in redis
const REDIS_SOCKET_DATA = 'socketdata';

// Separator to combine type, id to room id
const ROOM_SEP = '/';

// Room Types
const DOC_ROOM = 'doc';
const PRJ_ROOM = 'prj';


/**
 * class SyncService
 *
 * socket.io provides "rooms", i.e. channels/groups of sockets. Here rooms are
 * used per project and document (identified by the respective id). This makes
 * it easy to broadcast any changes regarding a project/document to its room.
 */
class SyncService {

  /**
   * SyncService constructor
   */
  constructor(io, redis) {
    this.io = io;
    this.redis = redis;

    io.on('connection', socket => {
      console.info(`${socket.id} connected`);

      // Send connection acknowledgement to user
      socket.emit(EVT.USER.CONNECTED, SERVER_NAME);

      // Listen for messages from user
      socket.on(
        MSG.USER.UPDATE,
        data => this._handleUserUpdate(socket, data)
      );

      // Handle disconnection
      socket.on('disconnecting', () => this._handleSocketDisconnecting(socket));
    });
  }

  /**
   * Handle socket logon
   */
  _handleUserUpdate(socket, data) {
    console.info(`${socket.id} user.update ${JSON.stringify(data)}`);

    // Add socket and its data to shared application state
    this.redis.hset([
      REDIS_SOCKET_DATA,
      socket.id,
      JSON.stringify({
        data,
        server: SERVER_NAME,
      }),
    ]);

    // Leave all document rooms that are not in updated data
    Object.keys(socket.rooms).map(room => {
      const { roomType, roomId } = room.split(ROOM_SEP);
      if (roomType === DOC_ROOM && roomId !== data.document) {
        socket.leave(room);
      }
    });

    // Join document room
    if (data.document) {
      socket.join(`${DOC_ROOM}${ROOM_SEP}${data.document}`);
    }

    // Join project room and notify all other users
    if (data.project) {
      const projectRoom = `${PRJ_ROOM}${ROOM_SEP}${data.project}`;
      socket.join(projectRoom);
      this._emitUserUpdate(projectRoom);
    }
  };

  /**
   * Handle disconnection of sockets
   */
  _handleSocketDisconnecting(socket) {

    // Remove socket data from shared application state
    this.redis.hdel(REDIS_SOCKET_DATA, socket.id);

    // Loop over socket's rooms/documents and remove socket from each
    Object.keys(socket.rooms).map(room => {
      socket.leave(room);

      // Emit user.updated in project room only
      if (room.split(ROOM_SEP)[0] === PRJ_ROOM) {
        this._emitUserUpdate(room);
      }
    });

    console.info(`${socket.id} disconnected`);
  };

  /**
   * Notify all sockets that watch a specific room, that the user list on
   * that room changed
   */
  _emitUserUpdate(roomid) {

    // Get all sockets in the document room. `clients` contains the socket ids
    this.io.in(roomid).clients((error, clients) => {

      // Build Redis command arguments for HMGET <key> <value> <value> …
      const redisArgs = [REDIS_SOCKET_DATA].concat(clients);

      // Get data for those clients to match additional data
      this.redis.hmget(redisArgs, (err, res) => {

        // Return empty array if anything goes wrong
        let data = [];

        // Only read data if res is truthy
        if (res) {
          // Map res array to data field if present, or fallback to {} and
          // filter out users that have not yet logged on with name, email and
          // picSrc
          data = res
            .map(clientData => JSON.parse(clientData))
            .map(json => json.data || {})
            .filter(data => data.name && data.email && data.picSrc);
        }

        // Broadcast event "user.updated" to document room if any data
        if (data.length > 0) {
          this.io.to(roomid).emit(
            EVT.USER.UPDATED,
            data
          );
        }
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
