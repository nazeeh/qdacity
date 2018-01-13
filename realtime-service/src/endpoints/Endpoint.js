const google = require('googleapis');
const CodesEndpoint = require('./CodesEndpoint');
const CodesystemEndpoint = require('./CodesystemEndpoint');

class Endpoint {
  constructor(apiRoot, apiVersion, token) {
    this._api = null;
    this._queue = [];

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.credentials = {
      access_token: token,
    };

    this.request = this._pushToQueue.bind(this);

    google.discoverAPI(
      `${apiRoot}/discovery/v1/apis/qdacity/${apiVersion}/rest`,
      {
        auth: oauth2Client,
      },
      (err, api) => {
        this._api = api;
        this.request = this._executeRequest.bind(this);
        this._queue.map(params => {
          this.request(
            params.endpoint,
            params.args,
          ).then(params.resolve, params.reject)
        });
      }
    );

    this.codes = new CodesEndpoint(this);
    this.codesystem = new CodesystemEndpoint(this);
  }

  _pushToQueue(endpoint, args) {
    return new Promise((resolve, reject) => {
      this._queue.push({ endpoint, args, resolve, reject });
    });
  }

  _executeRequest(endpoint, args) {
    return new Promise((resolve, reject) => {
      endpoint.split('.').reduce(
        (fn, segment) => fn[segment],
        this._api
      )(
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
