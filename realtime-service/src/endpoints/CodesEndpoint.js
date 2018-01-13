/**
 * CodesEndpoint class
 */
class CodesEndpoint {
  constructor(endpoint) {
    this._endpoint = endpoint;
  }
  insertCode(code, parentId) {
    return this._endpoint.request('codes.insertCode', {
      parentId,
      resource: code
    });
  }
  updateCode(code) {
    return this._endpoint.request('codes.updateCode', {
      resource: code,
    });
  }
  relocateCode(data) {
    return this._endpoint.request('codes.relocateCode', data);
  }
  removeCode(code) {
    return this._endpoint.request('codes.removeCode', {
      id: code.id,
    });
  }
}
module.exports = CodesEndpoint;
