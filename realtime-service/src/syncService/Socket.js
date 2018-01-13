const SERVER_NAME = require('../utils/serverName');
const Endpoint = require('../endpoints/Endpoint');
const {
  MSG,
  EVT
} = require('./constants.js');

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
    this._io = io;
    this._socket = ioSocket;
    this._redis = redis;

    this._project = '';
    this._document = '';
    this._api = null;
    this._apiData = {
      root: '',
      apiVersion: '',
      token: '',
    };

    // Listen to messages from client
    this._listen();

    // Send connection acknowledgement to client
    this._socket.emit(EVT.USER.CONNECTED, SERVER_NAME);
  };

  /**
   * Initialize listeners for messages sent by clients
   * @access private
   * @arg {object} account - Any serializable object
   */
  _listen() {
    [
      // Handle user messages
      [MSG.USER.UPDATE, this._handleUserUpdate],

      // Handle code messages
      [MSG.CODE.INSERT, this._handleCodeInsert],
      [MSG.CODE.RELOCATE, this._handleCodeRelocate],
      [MSG.CODE.REMOVE, this._handleCodeRemove],

      // Handle socket.io-internal message
      ['disconnecting', this._cleanup],
    ].map(def => this._socket.on(def[0], def[1].bind(this)));
  };

  /**
   * Cleanup on socket disconnection
   * @access private
   */
  _cleanup() {

    // Remove socket data from shared application state
    this._redis.hdel(REDIS_SOCKET_DATA, this._socket.id);

    // Loop over socket's rooms/documents and remove socket from each
    Object.keys(this._socket.rooms).map(room => {
      this._socket.leave(room);
      this._emitUserUpdated(room);
    });

    console.info(`${this._socket.id} disconnected`);
  };

  /**
   * Handle socket logon
   */
  _handleUserUpdate(data, ack) {
    console.info(`${this._socket.id} user.update ${JSON.stringify(data)}`);

    try {
      // Add socket and its data to shared application state
      this._updateRedis(data);

      // Update API client
      this._updateApi({
        root: data.apiRoot,
        version: data.apiVersion,
        token: data.token,
      });

      // Join project room and notify all other users
      this._updateRoom(PRJ_ROOM, data.project);

      // (Leave others and) join new document room
      this._updateRoom(DOC_ROOM, data.document);

      ack('ok');
    } catch (e) {
      ack('error', e.stack);
    }
  };

  /**
   * Handle code insertion
   */
  _handleCodeInsert(data, ack) {
    console.info(`${this._socket.id} code.insert ${JSON.stringify(data)}`);

    // Call backend API to insert code
    this._api.codes.insertCode(data.code, `${data.parentID}`)
      .then(res => this._handleApiResponse(EVT.CODE.INSERTED, ack, res))
      .catch((...foo) => ack('error', ...foo));
  };

  /**
   * Handle code relocation
   */
  _handleCodeRelocate(data, ack) {
    console.info(`${this._socket.id} code.relocate ${JSON.stringify(data)}`);

    // Call backend API to relocate code
    this._api.codes.relocateCode(data)
      .then(res => this._handleApiResponse(EVT.CODE.RELOCATED, ack, res))
      .catch((...foo) => ack('error', ...foo));
  };

  /**
   * Handle code removal
   */
  _handleCodeRemove(data, ack) {
    console.info(`${this._socket.id} code.remove ${JSON.stringify(data)}`);

    this._api.codes.removeCode(data)
      .then(res => this._handleApiResponse(EVT.CODE.REMOVED, ack, data))
      .catch((...foo) => ack('error', ...foo));
  };

  _handleApiResponse(event, ack, data) {
    ack('ok', data);

    // Emit code.removed event to socket's projectRoom
    this._emitToProject(event, data);
  };

  _updateRedis(data) {
    this._redis.hset([
      REDIS_SOCKET_DATA,
      this._socket.id,
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
  };

  _updateApi(newApiData) {
    // Do not update if api data did not change
    if (JSON.stringify(this._apiData) === JSON.stringify(newApiData)) {
      return;
    }

    this._api = new Endpoint(
      newApiData.root,
      newApiData.version,
      newApiData.token
    );

    // Update property
    this._apiData = newApiData;
  };

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

    // Leave all rooms that are not in updated data
    Object.keys(this._socket.rooms).map(room => {
      const { roomType, roomId } = room.split(ROOM_SEP);
      if (type === roomType && id !== roomId) {
        this._socket.leave(room);
        this._emitUserUpdated(room);
      }
    });

    // Join new room
    const newRoom = `${type}${ROOM_SEP}${id}`;
    this._socket.join(newRoom);
    this._emitUserUpdated(newRoom);

    // Update property
    this[property] = id;
  };

  /**
   * Notify all sockets that watch a specific room, that the user list on
   * that room changed
   */
  _emitUserUpdated(roomid) {

    // Get all sockets in the document room. `clients` contains the socket ids
    this._io.in(roomid).clients((error, clients) => {

      // Build Redis command arguments for HMGET <key> <value> <value> …
      const redisArgs = [REDIS_SOCKET_DATA].concat(clients);

      // Get data for those clients to match additional data
      this._redis.hmget(redisArgs, (err, res) => {
        // Do not emit if res is falsy
        if (!res) {
          return;
        }

        // Map res array to data field if present, or fallback to {} and
        // filter out users that have not yet logged on with name, email and
        // picSrc
        const data = res
          .map(clientData => {
            const json = JSON.parse(clientData);
            return json.data || {};
          })
          .filter(data => data.name && data.email && data.picSrc);

        // Broadcast event "user.updated" to document room if any data
        this._emitToRoom(roomid, EVT.USER.UPDATED, data);
      });
    });
  };

  _emitToProject(event, ...args) {
    this._emitToRoom(`${PRJ_ROOM}${ROOM_SEP}${this._project}`, event, ...args);
  };

  _emitToDocument(event, ...args) {
    this._emitToRoom(`${DOC_ROOM}${ROOM_SEP}${this._document}`, event, ...args);
  };

  _emitToRoom(room, event, ...args) {
    this._io.to(room).emit(event, ...args);
  };

};

module.exports = Socket;
