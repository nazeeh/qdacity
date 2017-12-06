/**
 * Module to define all non-websocket routes in express app
 */

const SERVER_NAME = require('./utils/serverName');

// Show server name on root route to easily identify the server from outside
module.exports = expressApp => {
  expressApp.get('/', (req, res) => {
    res.send('Welcome to ' + SERVER_NAME);
  });
};
