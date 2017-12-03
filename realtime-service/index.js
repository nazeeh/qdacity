/**
 * Main entry point for the application
 */

// load env file into process.env
require('dotenv').config();

// If no port is set in environment, fallback to 8080
if (!process.env.PORT) {
  process.env.PORT = 8080;
}

// run  the server
require('./src/server');
