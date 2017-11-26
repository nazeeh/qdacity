const serverName = require('../utils/serverName');

// redis instance, injected in init()
let redis;

// socket.io instance, injected in init()
let io;

// server side copy of the live edited docs
const synced_docs = [];

const assertDocExist = docid => {
  if (synced_docs[docid] === undefined) {
    synced_docs[docid] = '';
  }
};

const emitUserChange = docid => {
  io.in(docid).clients((error, clients) => {
    redis.hgetall(['usernames'], (err, res) => {
      io
        .to(docid)
        .emit(
          'user_change',
          docid,
          Object.keys(res).reduce(
            (acc, id) =>
              clients.indexOf(id) > -1
                ? acc.concat(JSON.parse(res[id]).username)
                : acc,
            []
          )
        );
    });
  });
};

const onLogon = socket => username => {
  socket.username = username;
  console.info(`user ${socket.id} logged on as ${socket.username}`);
  redis.hset([
    'usernames',
    socket.id,
    JSON.stringify({
      username: socket.username,
      server: serverName,
    }),
  ]);
  socket.emit('meta', 'Welcome ' + username + '!', serverName);
};

const onUserEnter = socket => (docid, data) =>
  addSocketToDocument(socket, docid, data);
const onUserLeave = socket => docid => removeSocketFromDocument(socket, docid);

const removeSocketFromDocument = (socket, docid) => {
  socket.leave(docid);
  emitUserChange(docid);
};
const addSocketToDocument = (socket, docid, data) => {
  socket.join(docid);
  emitUserChange(docid);
  assertDocExist(docid);
  if (synced_docs[docid] === '') synced_docs[docid] = data;
  io.in(docid).clients((error, clients) => {
    if (clients.length > 1) {
      socket.emit('sync', synced_docs[docid]);
    }
  });
};

const syncDoc = () => (docid, data) => {
  assertDocExist(docid);
  synced_docs[docid] = data;
  io.to(docid).emit('sync', synced_docs[docid]);
};

const onSocketDisconnect = socket => () => {
  redis.hdel(['usernames', socket.id]);
  Object.keys(synced_docs).map(docid => {
    io.in(docid).clients((error, clients) => {
      if (clients.indexOf(socket.id) > -1) {
        removeSocketFromDocument(socket, docid);
      }
    });
  });
  console.info(`user ${socket.id} (${socket.username}) disconnected`);
};

const init = (_io, _redis) => {
  io = _io;
  redis = _redis;

  io.on('connection', socket => {
    console.info(`user ${socket.id} connected`);

    socket.emit('meta', 'Connection established!', serverName);

    socket.on('logon', onLogon(socket));
    socket.on('user_enter', onUserEnter(socket));
    socket.on('user_leave', onUserLeave(socket));
    socket.on('sync', syncDoc());
    socket.on('disconnect', onSocketDisconnect(socket));
  });
};

module.exports = init;
