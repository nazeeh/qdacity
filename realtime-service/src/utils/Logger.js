/**
 * Winston logger with GCP plugin to log to both console
 * and Stackdriver logging.
 * Exports an instance of the logger (singleton)
 */
 
const winston = require('winston');
const WinstonLogger = winston.Logger;
const Console = winston.transports.Console;
// Imports the Google Cloud client library for Winston
const {LoggingWinston} = require('@google-cloud/logging-winston');
// Creates a Winston Stackdriver Logging client
//const loggingWinston = new LoggingWinston();


class Logger {
	constructor() {
		// Create a Winston logger that streams to Stackdriver Logging
		// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
		this.logger = new WinstonLogger({
		  level: 'info', // log at 'info' and above
		  transports: [
			// Log to the console
			new Console(),
			// And log to Stackdriver Logging
			new LoggingWinston(),
		  ],
		});
	}

	info(msg) {
		this.logger.info(msg);
	}
}

module.exports = new Logger();
