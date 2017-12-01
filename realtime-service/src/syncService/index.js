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
          res ? Object.keys(res).reduce(
            (acc, id) => {
              if (clients.indexOf(id) > -1) {
                const data = JSON.parse(res[id]);
                delete data.serverName;
                return acc.concat(data)
              } else {
                return acc;
              }
            },
            []
          ) : []
        );
    });
  });
};

const onLogon = socket => (name, email, picSrc) => {
  console.info(`user ${socket.id} logged on as ${name} (${email})`);
  redis.hset([
    'usernames',
    socket.id,
    JSON.stringify({
      name: name,
      email: email,
      picSrc: picSrc,
      server: serverName,
    }),
  ]);
  socket.emit('meta', 'Welcome ' + name + '!', serverName);
  Object.keys(socket.rooms).map(docid => emitUserChange(docid));
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

const onSocketDisconnecting = socket => () => {
  redis.hdel('usernames', socket.id);
  Object.keys(socket.rooms).map(docid => {
    removeSocketFromDocument(socket, docid);
  });
  console.info(`user ${socket.id} disconnected`);
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
    socket.on('disconnecting', onSocketDisconnecting(socket));
  });
};

module.exports = init;
