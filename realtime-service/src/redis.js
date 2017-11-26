const serverName = require('./utils/serverName');
const redisClient = require('redis').createClient;
const redisAdapter = require('socket.io-redis');

const {
  REDIS_SOCKET,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_AUTH,
} = process.env;

const keepAliveNamespace = 'server';
const keepAliveInterval = 60000; //ms
const keepAliveExpiration = 300; //secs
const keepAliveCleanupInterval = 600000; //ms

const redisConnectionOptions = {};
REDIS_SOCKET && (redisConnectionOptions.path = REDIS_SOCKET);
REDIS_HOST && (redisConnectionOptions.host = REDIS_HOST);
REDIS_PORT && (redisConnectionOptions.port = REDIS_PORT);
REDIS_AUTH && (redisConnectionOptions.password = REDIS_AUTH);

const redis = redisClient(redisConnectionOptions);

const initRedisKeepAlive = () => {
  const key = `${keepAliveNamespace}:${serverName}`;
  setInterval(() => {
    redis.expire(key, keepAliveExpiration);
  }, keepAliveInterval);
  redis.set(key, 1);
  redis.expire(key, keepAliveExpiration);
};

const initRedisCleanup = () => {
  setInterval(() => {
    redis.hgetall('usernames', (err, res) =>
      !!res && Object.keys(res).map(id =>
        redis.get(
          'server:' + JSON.parse(res[id]).server,
          (err, res) => res === null && redis.hdel(['usernames', id])
        )
      )
    );
  }, keepAliveCleanupInterval);
};

const init = socketio => {
  initRedisKeepAlive();
  initRedisCleanup();

  socketio.adapter(
    redisAdapter({
      pubClient: redisClient(redisConnectionOptions),
      subClient: redisClient(redisConnectionOptions),
    })
  );

  return redis;
};

module.exports = init;
