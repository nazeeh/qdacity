const util = require('util');

const SERVER_NAME = require('../utils/serverName');
const delay = require('../utils/delay');

// Lock TTL in milliseconds
const LOCK_TTL = 61000;

/**
 * Document Lock Manager
 *
 * Uses Redis to set/refresh/release a lock on a specific document
 */
class DocumentLock {

  /**
   * Constructor for DocumentLock
   *
   * @public
   * @arg {object} redis - Redis instance to use
   * @arg {string} apiHost - Hostname of the backend the document belongs to
   * @arg {string} documentId - ID of the document to manage the lock for
   */
  constructor(redis, apiHost, documentId) {
    const lockEntryKey = `lock:document:${apiHost}:${documentId}`;

    /**
     * Set a key-value-entry in redis
     *
     * SET <key> <value> NX PX <ttl>
     *   <key> - The unique key for this lock
     *   <value> - This server's unique name
     *   NX - Only set the redis entry if it is not set already, i.e. if the
     *        lock is not already acquired
     *   PX <ttl> - Automatically expire (= delete) the entry after <ttl> ms
     */
    this._setLock = util.promisify(redis.set)
      .bind(redis, [lockEntryKey, SERVER_NAME, 'NX', 'PX', LOCK_TTL]);

    /**
     * Get the value of a key-value-entry from redis
     * GET <key>
     *   <key> - The unique key for this lock
     */
    this._getLock = util.promisify(redis.get).bind(redis, [lockEntryKey]);

    /**
     * Set the expiration time of a key-value-entry in redis
     * PEXIPIRE <ttl>
     *   <ttl> - Automatically expire (= delete) the entry after <ttl> ms
     */
    this._refreshLock = util.promisify(redis.pexpire)
      .bind(redis, [lockEntryKey, LOCK_TTL]);

    /**
     * Delete a key-value-entry from redis
     * DEL <key>
     *   <key> - The unique key for this lock
     */
    this._deleteLock = util.promisify(redis.del).bind(redis, [lockEntryKey]);
  }

  /**
   * Try to set the lock.
   *
   * If timeout is not set, exactly 1 attempt will be made If timeout is set,
   * no further attempt will be made after timeout milliseconds. Be aware that
   * the last attempt might occur 1ms before timeout is over but will take
   * several milliseconds itself. So the overall time in this method will
   * probably be over timeout milliseconds. Optionally the waitTime between
   * two retries can be set.
   *
   * @public
   * @arg {int} timeout - Milliseconds to wait at maximum, defaults to 0
   * @arg {int} waitTime - Milliseconds to wait between retries, defaults to 100
   * @return {Promise} resolves on successful locking, rejects else
   */
  async acquire(timeout = 0, waitTime = 100) {

      // Calculate time to staop at
      const stopTime = Date.now() + timeout;

      // Try at least once
      do {

        try {
          // Try to set lock
          const response = await this._setLock();

          // Resolve if the lock could be acquired
          if (response == 'OK') {
            return Promise.resolve();
          }

        } catch(err) {
          // Reject if any error was set
          return Promise.reject(err);
        }

        // wait for waitTime milliseconds before starting the next attempt
        await delay(waitTime);

        // Start the next attempt if not timed out yet
      } while(Date.now() < stopTime);

      // No further attempt is made, reject
      return Promise.reject('timed out');
  }

  /**
   * Refresh the lock.
   *
   * @public
   * @return {Promise} resolves on successful refresh, rejects else
   */
  async refresh() {

    try {
      // Get the name of the currently locking server
      const lockingServer = await this._getLock();

      // Check if lock belongs to this server
      if (lockingServer == SERVER_NAME) {

        try {
          // Try to extend the TTL of the lock entry
          const success = await this._refreshLock();

          // Resolve if extension succeeded, reject if not
          return success == 1 ? Promise.resolve() : Promise.reject();

        } catch(err) {
          // Reject if extension failed
          return Promise.reject(err);
        }

      } else {
        // Reject if lock belongs not this server
        Promise.reject('Other server has lock');
      }

    } catch(err) {
      // Reject if any error occurs while getting the current lock entry
      return Promise.reject(err);
    }
  }

  /**
   * Release the lock.
   *
   * The returned promise will never resolve or reject.
   *
   * @public
   */
  async release() {

    try {

      // Get the name of the currently locking server
      const lockingServer = await this._getLock();

      // Only delete, if lock belongs to this server
      if (lockingServer == SERVER_NAME) {
        await this._deleteLock();
      }

    } catch (error) {
      // ignore any errors
    }

  }
};

module.exports = DocumentLock;
