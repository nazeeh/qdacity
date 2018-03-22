const { Value } = require('slate');
const util = require('util');

/**
 * Document Cache Manager
 *
 * Uses Redis to cache documents. Cache entries will expire after 10 minutes
 */
class DocumentCache {
  /**
   * Constructor for DocumentCache
   *
   * @public
   * @arg {object} redis - Redis instance to use
   * @arg {string} apiHost - Hostname of the backend the document belongs to
   * @arg {string} documentId - ID of the document to manage the lock for
   */
  constructor(redis, apiHost, documentId) {
    const cacheEntryKey = `cache:document:${apiHost}:${documentId}`;

    /**
     * Set a key-value-entry in redis
     *
     * SET <key> <value> EX <ttl>
     *   <key> - The unique key for this cache entry
     * Parameters being set in {@link this#store}:
     *   <value> - The documents JSON
     *   EX <ttl> - Automatically expire (= delete) the entry after <ttl> sec
     */
    this._setDocument = util.promisify(redis.set).bind(redis, cacheEntryKey);

    /**
     * Get the value of a key-value-entry from redis
     * GET <key>
     *   <key> - The unique key for this cache entry
     */
    this._getDocument = util.promisify(redis.get).bind(redis, cacheEntryKey);
  }

  /**
   * Try to store document in cache
   *
   * @public
   * @arg {object} document
   * @return {Promise} resolves if document was stored or rejects
   */
  async store(document) {

    try {
      // Copy document, serialize Slate.Value and serialize everything to JSON
      const doc = JSON.stringify({
        ...document,
        value: document.value.toJSON(),
      });

      // Try to store the document
      const response = await this._setDocument([doc, 'EX', 600]);

      return response == 'OK' ? Promise.resolve() : Promise.reject();
    } catch(error) {
      return Promise.reject(error);
    }
  }

  /**
   * Try to get document from cache
   *
   * @public
   * @return {Promise} resolves with the document state if existing or rejects
   */
  async get() {

    try {
      // Try to get the document from redis
      const response = await this._getDocument();

      if (response === null) {
        return Promise.reject('cache miss');
      } else {
        // Deserialize document
        const doc = JSON.parse(response);

        // Deserialize Slate.Value
        doc.value = Value.fromJSON(doc.value);

        return Promise.resolve(doc);
      }

    } catch(error) {
      return Promise.reject(error);
    }
  }
};

module.exports = DocumentCache;
