const SERVER_NAME = require('../utils/serverName');
const logger = require('../utils/Logger');
const Endpoint = require('../endpoints/Endpoint');
const CodesHandler = require('./CodesHandler');
const DocumentHandler = require('./DocumentHandler');
const { MSG, EVT } = require('./constants.js');

// Key to use for socket data hash in redis
const REDIS_SOCKET_DATA = 'socketdata';

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

    // User data
    this.project = {
      id: '',
      type: '',
    };

    // Listen to meta messages from client
    this.socket.on(MSG.USER.UPDATE, this._handleUserUpdate.bind(this));
    this.socket.on('disconnecting', this._handleUserDisconnecting.bind(this));

    // Initialize handlers for specific domains
    new CodesHandler(this);
    new DocumentHandler(this, redis);

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

    logger.info(`${this.socket.id} disconnected`);
  }

  /**
   * Handle update of user data
   * @private
   * @arg {object} data - object describing the connected user. Expected keys:
   *                      { name, email, picSrc, apiRoot, apiVersion, token,
   *                        project: { id, type }, document }
   * @arg {function} ack - acknowledge function will be called with argument
   *                       ("ok") on success or ("error", stack) on failure
   */
  _handleUserUpdate(data, ack) {
    logger.debug(`${this.socket.id} user.update ${JSON.stringify(data)}`);

    try {
      // Add socket and its data to shared application state
      this._updateRedis(data);

      // Update API client
      this.api.updateParameters(data.apiRoot, data.apiVersion, data.token);

      // (Leave previous and) join new project room
      this._updateProjectRoom(data.project);

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
  handleApiResponse(event, ack, res) {
    // Send acknowledgement to initiating client
    logger.debug(' Acknowledging ' + JSON.stringify({...res}));
    ack('ok', res);

    // Emit event to socket's projectRoom
    this._emitToProject(event, res);
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
          project: {
            id: data.project.id,
            type: data.project.type,
          },
          document: data.document,
        },
        server: SERVER_NAME,
      }),
    ]);
  }

  /**
   * Update this sockets project or document and emit change to all clients.
   * @private
   * @arg {object} project - Project data for the update. Required properties:
   *                         { id, type }
   */
  _updateProjectRoom(project) {

    // Do not update if id did not change
    if (this.project.id === project.id && this.project.type === project.type) {
      return;
    }

    this.project = project;

    const newRoom = this._getProjectRoomName();

    // Leave all rooms that are not in updated data
    Object.keys(this.socket.rooms).map(room => {
      if (room !== newRoom) {
        this.socket.leave(room);
      }
    });

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
    const roomid = this._getProjectRoomName();

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
              data.project.id === this.project.id &&
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
    this._io
      .to(this._getProjectRoomName())
      .emit(event, ...args);
  }

  /**
   * Build project room name
   * @return {string} project room name
   */
  _getProjectRoomName() {
    return `prj/${this.project.type}/${this.project.id}`;
  }
}

module.exports = Socket;
