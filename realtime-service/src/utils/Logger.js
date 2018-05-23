const winston = require('winston');
const { LoggingWinston } = require('@google-cloud/logging-winston');

/**
 * Winston logger with GCP plugin to log to both console
 * and Stackdriver logging.
 * Exports an instance of the logger (singleton)
 */
class Logger {
  constructor() {
    // Create a Winston logger that streams to Stackdriver Logging
    // Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
    this.logger = new winston.Logger({
      transports: [
        // Log to the console
        new winston.transports.Console({
          level: 'info',
        }),
        // And log to Stackdriver Logging
        new LoggingWinston({
          level: 'info',
        }),
      ],
    });
  }

  debug(...msg) {
    this.logger.debug(...msg);
  }

  info(...msg) {
    this.logger.info(...msg);
  }

  warn(...msg) {
    this.logger.warn(...msg);
  }

  error(...msg) {
    this.logger.error(...msg);
  }
}

module.exports = new Logger();
