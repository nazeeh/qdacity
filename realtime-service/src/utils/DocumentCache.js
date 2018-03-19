const { Value } = require('slate');
const util = require('util');

/**
 * Document Cache Manager
 *
 * Uses Redis to cache documents. Cache entries will expire after 10 minutes
 */
class DocumentCache {
  constructor(redis) {
    this._redis_set = util.promisify(redis.set).bind(redis);
    this._redis_get = util.promisify(redis.get).bind(redis);
  }

  /**
   * Try to store document in cache
   *
   * @public
   * @arg {string} id - ID of the document
   * @arg {object} document
   * @return {Promise} resolves if document was stored or rejects
   */
  async store(id, document) {

    try {
      // Copy document, serialize Slate.Value and serialize everything to JSON
      const doc = JSON.stringify({
        ...document,
        value: document.value.toJSON(),
      });

      // Try to store the document
      const response = await this._setDocument(id, doc);

      return response == 'OK' ? Promise.resolve() : Promise.reject();
    } catch(error) {
      return Promise.reject(error);
    }
  }

  /**
   * Try to get document from cache
   *
   * @public
   * @arg {string} documentId
   * @return {Promise} resolves with the document state if existing or rejects
   */
  async get(documentId) {

    try {
      // Try to get the document from redis
      const response = await this._getDocument(documentId);

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

  /**
   * Wrapper for redis.set, handling key prefixing and TTL
   * @arg {string} id - cache ID, will be prefixed with constant prefix
   * @arg {string} doc - Document to cache
   * @return {Promise} - Redis set promise
   */
  _setDocument(id, doc) {
    return this._redis_set([`documentcache:${id}`, doc, 'EX', 600]);
  }

  /**
   * Wrapper for redis.get, handling key prefixing
   * @arg {string} id - cache ID, will be prefixed with constant prefix
   * @return {Promise} - Redis set promise
   */
  _getDocument(id) {
    return this._redis_get([`documentcache:${id}`]);
  }
};

module.exports = DocumentCache;
