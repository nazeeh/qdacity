const google = require('googleapis');
const logger = require('../utils/Logger');

/**
 * Endpoint class
 *
 * One instance is created per connected socket, using the connected user's
 * credentials and their configured API URL.
 */
class Endpoint {
  constructor() {
    // Initialize API parameters
    this._apiRoot = '';
    this._apiVersion = '';
    this._apiToken = '';

    // Initialize api and queue
    this._api = null;
    this._queue = [];
  }

  /**
   * @property {string} apiHost - Computed property containing the host name
   * of the configured API
   */
  get apiHost() {
    return this._apiRoot.replace(/.*?\/\/([^\/]+)\/.*/, '$1');
  }

  /**
   * Update API parameters. Endpoint tries to connect to the API as soon as
   * the provided parameters are complete, and after that only reconnects if
   * at least one of the parameters changed.
   * @public
   * @arg {string} root - The API's root url, e.g. "https://myapp.appspot.com/_ah/api"
   * @arg {string} version - The API version, e.g. "v10"
   * @arg {string} token - The authorization token.
   */
  updateParameters(root, version, token) {
    // Do not update if api data did not change
    if (
      root == this._apiRoot &&
      version == this._apiVersion &&
      token == this._apiToken
    ) {
      return;
    }

    // Update properties
    this._apiRoot = root;
    this._apiVersion = version;
    this._apiToken = token;

    // Do not connect to API, if any of the arguments is falsy
    if (!root || !version || !token) {
      return;
    }

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
      `${root}/discovery/v1/apis/qdacity/${version}/rest`,
      {
        auth: oauth2Client,
      },
      (err, api) => {
        // Error: Something went wrong, e.g. API configuration wrong or
        // authorization invalid.
        if (err) {
          logger.error('API discovery failed', err);
          this._queue.map(params => params.reject('API discovery failed'));
          return;
        }

        // Set new api and process queued requests
        this._api = api;
        this._queue.map(params => {
          this._executeRequest(params.endpoint, params.args).then(
            params.resolve,
            params.reject
          );
        });
      }
    );
  }

  /**
   * Send request to API endpoint.
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
      const fn = endpoint
        .split('.')
        .reduce((fn, segment) => fn[segment], this._api);

      // Define Response handle that translates to promise resolve/reject
      const handleResponse = (err, res) => (err ? reject(err) : resolve(res));

      // Call the function with arguments and pass result to resolve/reject
      fn(args, handleResponse);
    });
  }
}

module.exports = Endpoint;
