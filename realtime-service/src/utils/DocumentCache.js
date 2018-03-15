
/**
 * Document Cache Manager
 *
 * Uses Redis to cache documents
 */
class DocumentCache {
  constructor(redis) {
    this.redis = redis;
  }

  /**
   * Try to store document in cache
   *
   * @public
   * @arg {string} documentId,
   * @arg {object} value - document state
   * @return {Promise} resolves if document was stored or rejects
   */
  store(documentId, value) {
    return new Promise((resolve, reject) => {

      // Try to store the document
      this.redis.set(
        [`documentcache:${documentId}`, JSON.stringify(value)],
        (error, response) => response == 'OK' ? resolve() : reject()
      );

    });
  }

  /**
   * Try to get document from cache
   *
   * @public
   * @arg {string} documentId
   * @return {Promise} resolves with the document state if existing or rejects
   */
  get(documentId) {
    return new Promise((resolve, reject) => {

      // Try to get the document from redis
      this.redis.get([`documentcache:${documentId}`], (error, response) => {
        if (error !== null) {
          reject(error);
        } else if(response === null) {
          reject('cache miss');
        } else {
          resolve(JSON.parse(response));
        }
      });
    });
  }
};

module.exports = DocumentCache;
