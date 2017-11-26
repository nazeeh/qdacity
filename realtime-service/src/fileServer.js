const serverName = require('./utils/serverName');

const init = express_app => {
  express_app.get('/', (req, res) => {
    res.send('Welcome to ' + serverName);
  });
};

module.exports = init;
