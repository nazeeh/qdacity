const { Value } = require('slate');
const util = require('util');

/**
 * Document Cache Manager
 *
 * Uses Redis to cache documents
 */
class DocumentCache {
  constructor(redis) {
    this.setDocument = util.promisify(redis.set).bind(redis);
    this.getDocument = util.promisify(redis.get).bind(redis);
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
      const response = await this.setDocument([ `documentcache:${id}`, doc]);

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
      const response = await this.getDocument([`documentcache:${documentId}`]);

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
