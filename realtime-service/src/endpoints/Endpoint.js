const google = require('googleapis');

/**
 * Endpoint class
 *
 * One instance is created per connected socket, using the connected user's
 * credentials and their configured API URL.
 *
 * Additionally to the documented methods, API endpoints can be called
 * directly. E.g. endpoint.codes.insertCode(args) resolves to
 * endpoint.request('codes.insertCode', args);
 *
 */
class Endpoint {
  constructor() {

    // Initialize api and queue
    this._api = null;
    this._queue = [];

    // Return proxy to directly handle api endpoints as objects with methods
    // e.g. endpoint.codes.insertCode(param) resolves to
    // endpoint._executeRequest('codes.insertCode', param);
    return new Proxy(this, {
      get: (target, property) => {
        return target.propertyIsEnumerable(property)
            || typeof target[property] === 'function'
          ? target[property]
          : new Proxy(target, {
              get: (target, method) => {
                return target.request.bind(target, `${property}.${method}`);
              }
            });
      }
    });
  }

  /**
   * Connect or reconnect to specific API URL with specific authorization
   * token. Should be called initially and if authorization token changes.
   * Requests that are made before first connection or while reconnecting,
   * are queued and executed afterwards.
   * @public
   * @arg {string} apiRoot - The API's root url, e.g.
   *                         "https://myapp.appspot.com/_ah/api"
   * @arg {string} apiVersion - The API version, e.g. "v10"
   * @arg {string} token - The authorization token.
   */
  connect(apiRoot, apiVersion, token) {

    // Reset queue and set current API to null to enable queueing
    this._queue = [];
    this._api = null;

    // Create authentication object
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.credentials = {
      access_token: token,
    };

    // Try to discover the API
    google.discoverAPI(
      `${apiRoot}/discovery/v1/apis/qdacity/${apiVersion}/rest`,
      {
        auth: oauth2Client,
      },
      (err, api) => {

        // Error: Something went wrong, e.g. API configuration wrong or
        // authorization invalid.
        if(err) {
          console.error("API discovery failed", err);
          this._queue.map(params => params.reject('API discovery failed'));
          return;
        }

        // Set new api and process queued requests
        this._api = api;
        this._queue.map(params => {
          this._executeRequest(
            params.endpoint,
            params.args,
          ).then(params.resolve, params.reject)
        });
      }
    );

  }

  /**
   * Send request to API endpoint.
   *
   * Instead of using this method, rather call the endpoints directly.
   * E.g. this.codes.insertCode(args) resolves to
   * this.request('codes.insertCode', args);
   *
   * @public
   * @arg {string} endpoint - Dot-notated sub method of the api. E.g.
   *                          `codes.insertCode`
   * @arg {object} args - Argument object as required by the endpoint.
   * @return {Promise} - Resolves on successful API response, rejects on any
   *                     errors.
   */
  request(endpoint, args) {
    if (this._api === null) {
      return this._pushToQueue(endpoint, args);
    } else {
      return this._executeRequest(endpoint, args);
    }
  }

  /**
   * Before the API object is loaded the requests are queued and triggered
   * later.
   * @private
   * @arg {string} endpoint - Dot-notated sub method of the api. E.g.
   *                          `codes.insertCode`
   * @arg {object} args - Argument object as required by the endpoint.
   * @return {Promise} - Resolves on successful API response, rejects on any
   *                     errors.
   */
  _pushToQueue(endpoint, args) {
    return new Promise((resolve, reject) => {
      this._queue.push({ endpoint, args, resolve, reject });
    });
  }

  /**
   * API requesting method
   * @private
   * @arg {string} endpoint - Dot-notated sub method of the api. E.g.
   *                          `codes.insertCode`
   * @arg {object} args - Argument object as required by the endpoint.
   * @return {Promise} - Resolves on successful API response, rejects on any
   *                     errors.
   */
  _executeRequest(endpoint, args) {

    return new Promise((resolve, reject) => {
      // Translate dot-notated method to real function instance
      const fn = endpoint.split('.').reduce(
        (fn, segment) => fn[segment],
        this._api
      );

      // Call the function with arguments and pass result to resolve/reject
      fn(
        args,
        (err, res) => {
          if(err) {
            reject(err);
          } else {
            resolve(res);
          }
        }
      );

    });

  }

};

module.exports = Endpoint;
