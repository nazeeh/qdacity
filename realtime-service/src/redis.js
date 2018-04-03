/**
 * Module to setup all Redis connections
 */

const redisClient = require('redis').createClient;
const redisAdapter = require('socket.io-redis');
const SERVER_NAME = require('./utils/serverName');

// Read configuration constants from environment
const {
  REDIS_SOCKET,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_AUTH,
  KEEP_ALIVE_INTERVAL,
  KEEP_ALIVE_TIMEOUT,
  KEEP_ALIVE_CLEANUP_INTERVAL,
} = process.env;

// Define settings and defaults for keepalive messages sent to Redis
const KEEP_ALIVE_NAMESPACE = 'server';

/**
 * Initialize Redis connection
 */
const buildRedisConnectionOptions = () => {
  // Set Redis connection settings from environment
  const redisConnectionOptions = {};
  REDIS_SOCKET && (redisConnectionOptions.path = REDIS_SOCKET);
  REDIS_HOST && (redisConnectionOptions.host = REDIS_HOST);
  REDIS_PORT && (redisConnectionOptions.port = parseInt(REDIS_PORT));
  REDIS_AUTH && (redisConnectionOptions.password = REDIS_AUTH);

  return redisConnectionOptions;
};

/**
 * Setup periodical keep-alive messages to Redis
 */
const initRedisKeepAlive = redis => {
  // Key to be used for keepalive entry in Redis
  const key = `${KEEP_ALIVE_NAMESPACE}:${SERVER_NAME}`;

  // Periodically set the TTL for the keepalive entry in Redis
  setInterval(() => {
    redis.expire(key, parseInt(KEEP_ALIVE_TIMEOUT));
  }, parseInt(KEEP_ALIVE_INTERVAL));

  // Setup the keepalive entry to arbitrary value and set TTL initially
  redis.set(key, 1);
  redis.expire(key, parseInt(KEEP_ALIVE_TIMEOUT));
};

/**
 * Setup periodical cleanup of timed out servers' data from Redis
 */
const initRedisCleanup = redis => {
  setInterval(() => {
    // Get all entries of shared application state (containing logged on users)
    redis.hgetall('socketdata', (err, res) => {
      // Nothing to do
      if (!res) {
        return;
      }

      // Loop over all keys (= socket ids)
      Object.keys(res).map(id => {
        // Read which server setup the socket data
        const server = JSON.parse(res[id]).server;

        // Get the keepalive entry of the corresponding server
        redis.get(`${KEEP_ALIVE_NAMESPACE}:${server}`, (err, res) => {
          // If keepalive entry expired, delete this socket's data
          res === null && redis.hdel('socketdata', id);
        });
      });
    });
  }, parseInt(KEEP_ALIVE_CLEANUP_INTERVAL));
};

/**
 * Initialize Redis connections for keepalive, shared application state,
 * socket.io-pubsub
 */
module.exports = socketio => {
  const redisConnectionOptions = buildRedisConnectionOptions();

  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('X' + REDIS_SOCKET + 'X');
  console.log('X' + REDIS_HOST + 'X');
  console.log('X' + REDIS_PORT + 'X');
  console.log('X' + REDIS_AUTH + 'X');
  console.log('X' + KEEP_ALIVE_INTERVAL + 'X');
  console.log('X' + KEEP_ALIVE_TIMEOUT + 'X');
  console.log('X' + KEEP_ALIVE_CLEANUP_INTERVAL + 'X');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');

  const redis = redisClient(redisConnectionOptions);
  initRedisKeepAlive(redis);
  initRedisCleanup(redis);

  // Setup socket.io to use Redis adapter for synchronisation of multiple
  // NodeJS/socket.io-nodes
  socketio.adapter(
    redisAdapter({
      pubClient: redisClient(redisConnectionOptions),
      subClient: redisClient(redisConnectionOptions),
    })
  );

  return redis;
};
