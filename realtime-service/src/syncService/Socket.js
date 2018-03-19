const SERVER_NAME = require('../utils/serverName');
const Endpoint = require('../endpoints/Endpoint');
const CodesHandler = require('./CodesHandler');
const { MSG, EVT } = require('./constants.js');

// Key to use for socket data hash in redis
const REDIS_SOCKET_DATA = 'socketdata';

// Separator to combine type, id to room id
const ROOM_SEP = '/';

// Room Types
const DOC_ROOM = 'doc';
const PRJ_ROOM = 'prj';

/**
 * Wrapper class to handle socket connections
 *
 * socket.io provides "rooms", i.e. channels/groups of sockets. Here rooms are
 * used per project and document (identified by the respective id). This makes
 * it easy to broadcast any changes regarding a project/document to its room.
 */
class Socket {
  /**
   * Constructor for Socket initializes listeners and sends ack to client
   */
  constructor(io, ioSocket, redis) {
    // Public properties
    this.socket = ioSocket;
    this.api = new Endpoint();

    // Private properties
    this._io = io;
    this._redis = redis;
    this._project = '';
    this._document = '';

    // Listen to meta messages from client
    this.socket.on(MSG.USER.UPDATE, this._handleUserUpdate.bind(this));
    this.socket.on('disconnecting', this._handleUserDisconnecting.bind(this));

    // Initialize handlers for specific domains
    new CodesHandler(this);

    // Send connection acknowledgement to client
    this.socket.emit(EVT.USER.CONNECTED, SERVER_NAME);
  }

  /**
   * Cleanup on socket disconnection
   * @private
   */
  _handleUserDisconnecting() {
    // Remove socket data from shared application state
    this._redis.hdel(REDIS_SOCKET_DATA, this.socket.id);

    // Loop over socket's rooms/documents and remove socket from each
    Object.keys(this.socket.rooms).map(room => {
      this.socket.leave(room);
    });
    this._emitUserUpdated();

    console.info(`${this.socket.id} disconnected`);
  }

  /**
   * Handle update of user data
   * @private
   * @arg {object} data - object describing the connected user. Expected keys:
   *                      { name, email, picSrc, apiRoot, apiVersion, token,
   *                        project, document }
   * @arg {function} ack - acknowledge function will be called with argument
   *                       ("ok") on success or ("error", stack) on failure
   */
  _handleUserUpdate(data, ack) {
    console.info(`${this.socket.id} user.update ${JSON.stringify(data)}`);

    try {
      // Add socket and its data to shared application state
      this._updateRedis(data);

      // Update API client
      this.api.updateParameters(data.apiRoot, data.apiVersion, data.token);

      // (Leave previous and) join new project room
      this._updateRoom(PRJ_ROOM, data.project);

      // (Leave others and) join new document room
      this._updateRoom(DOC_ROOM, data.document);

      ack('ok');
    } catch (e) {
      ack('error', e.stack);
    }
  }

  /**
   * Handle successful API response and send ("ok", data) to initiating
   * client (via ack function) and emit event with data to all connected clients
   * @public
   * @arg {string} event - The event to be sent to all clients. Should be one
   *                       of EVT constants. Will sent data parameter.
   * @arg {function} ack - acknowledge function will be called with arguments
   *                       ("ok", data), with data being data parameter.
   * @arg {mixed} data - Data to be sent with ack and event.
   */
  handleApiResponse(event, ack, data) {
    // Send acknowledgement to initiating client
    ack('ok', data);

    // Emit event to socket's projectRoom
    this._emitToProject(event, data);
  }

  /**
   * Update shared socket data in redis database.
   * @private
   * @arg {object} data - Data of the user connected via this socket.
   */
  _updateRedis(data) {
    this._redis.hset([
      REDIS_SOCKET_DATA,
      this.socket.id,
      JSON.stringify({
        data: {
          name: data.name,
          email: data.email,
          picSrc: data.picSrc,
          project: data.project,
          document: data.document,
        },
        server: SERVER_NAME,
      }),
    ]);
  }

  /**
   * Update this sockets project or document and emit change to all clients.
   * @private
   * @arg {string} type - Room type. Use only constants DOC_ROOM and PRJ_ROOM
   * @arg {string} id - ID of the document or project room
   */
  _updateRoom(type, id) {
    // Allow only certain room types
    if (type !== DOC_ROOM && type !== PRJ_ROOM) {
      console.error('Invalid type used in Socket._updateRoom(type, id)');
      return;
    }

    const property = type === DOC_ROOM ? '_document' : '_project';

    // Do not update if id did not change
    if (this[property] === id) {
      return;
    }

    // Update property
    this[property] = id;

    // Leave all rooms that are not in updated data
    Object.keys(this.socket.rooms).map(room => {
      const { roomType, roomId } = room.split(ROOM_SEP);
      if (type === roomType && id !== roomId) {
        this.socket.leave(room);
      }
    });

    // Join new room
    const newRoom = `${type}${ROOM_SEP}${id}`;
    this.socket.join(newRoom);

    // Emit user update to project room
    this._emitUserUpdated();
  }

  /**
   * Send event to all clients in the same project room as this socket, that
   * the user list of this project has changed.
   * @private
   */
  _emitUserUpdated() {
    // Get project room name
    const roomid = `${PRJ_ROOM}${ROOM_SEP}${this._project}`;

    // Get all sockets in the document room.
    this._io.in(roomid).clients((error, socketIds) => {
      // Build Redis command arguments for HMGET <key> <value> <value> …
      const redisArgs = [REDIS_SOCKET_DATA].concat(socketIds);

      // Get data for those clients to match additional data
      this._redis.hmget(redisArgs, (error, response) => {
        // Do not emit if response is falsy
        if (!response) {
          return;
        }

        // Map response array to data field if present, or fallback to {} and
        // filter out users that have not yet logged on with name, email and
        // picSrc or are not in same project.
        const data = response
          .map(clientData => {
            const json = JSON.parse(clientData);
			return (json && json.data) ? json.data : {};
          })
          .filter(
            data =>
              data.project == this._project &&
              data.name &&
              data.email &&
              data.picSrc
          );

        // Send event "user.updated" to project room
        this._emitToProject(EVT.USER.UPDATED, data);
      });
    });
  }

  /**
   * Send event to this socket's project room
   * @private
   * @arg {string} event - The event to emit
   * @arg {...mixed} args - Any arguments to send with the event
   */
  _emitToProject(event, ...args) {
    this._emitToRoom(`${PRJ_ROOM}${ROOM_SEP}${this._project}`, event, ...args);
  }

  /**
   * Send event to this socket's document room
   * @private
   * @arg {string} event - The event to emit
   * @arg {...mixed} args - Any arguments to send with the event
   */
  _emitToDocument(event, ...args) {
    this._emitToRoom(`${DOC_ROOM}${ROOM_SEP}${this._document}`, event, ...args);
  }

  /**
   * Send event to some room
   * @private
   * @arg {string} room - The room to send to
   * @arg {string} event - The event to emit
   * @arg {...mixed} args - Any arguments to send with the event
   */
  _emitToRoom(room, event, ...args) {
    this._io.to(room).emit(event, ...args);
  }
}

module.exports = Socket;
