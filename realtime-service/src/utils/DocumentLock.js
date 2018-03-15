const SERVER_NAME = require('../utils/serverName');

// Lock TTL in milliseconds
const LOCK_TIME = 10000;

/**
 * Document Lock Manager
 *
 * Uses Redis to set/refresh/release a lock on a specific document
 */
class DocumentLock {

  constructor(redis, documentId) {
    this.redis = redis;
    this.lockEntryKey = `lock:document:${documentId}`;
  }

  /**
   * Set the lock
   *
   * @public
   * @return {Promise} resolves on successful locking, rejects else
   */
  acquire() {
    return new Promise((resolve, reject) => {

      // Try to set lock
      this.redis.set(
        [this.lockEntryKey, SERVER_NAME, 'NX', 'PX', LOCK_TIME],
        (err, response) => response == 'OK' ?  resolve() : reject()
      );

    });
  }

  /**
   * Refresh the lock
   *
   * @public
   * @return {Promise} resolves on successful refresh, rejects else
   */
  refresh() {
    return new Promise((resolve, reject) => {

      // Get lock
      this.redis.get([this.lockEntryKey], (error, response) => {

        // Check if lock belongs to this server
        if (response == SERVER_NAME) {

          // If yes, try to extend the TTL
          this.redis.pexpire(
            [this.lockEntryKey, LOCK_TIME],
            (error, response) => {
              response == '1' ? resolve() : reject();
            }
          );

        } else {
          reject();
        }
      });
    });
  }

  /**
   * Refresh the lock
   *
   * @public
   */
  release() {

    // Get lock
    this.redis.get([this.lockEntryKey], (error, response) => {

      // Delete if lock belongs to this server
      if (response == SERVER_NAME) {
        this.redis.del([this.lockEntryKey]);
      }

    });

  }
};

module.exports = DocumentLock;
