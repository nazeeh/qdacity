/**
 * Utility module to set a consistent unique server name
 *
 * Name is calculated from hostname, port and start time.
 * Exports the server name as string
 */

const hostname = require('os').hostname();
const port = process.env.PORT;
const timestamp = Date.now();

module.exports = `${hostname}:${port}@${timestamp}`;
