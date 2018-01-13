/**
 * CodesystemEndpoint class
 */
class CodesystemEndpoint {
  constructor(endpoint) {
    this._endpoint = endpoint;
  }
  insertCodeSystem(project, projectType) {
    return this._endpoint.request('codesystem.insertCodeSystem', {
      project,
      projectType,
    });
  }
  updateCodeSystem(codeSystem) {
    return this._endpoint.request('codesystem.updateCodeSystem', {
      resource: codeSystem,
    });
  }
  getCodeSystem(id) {
    return this._endpoint.request('codesystem.getCodeSystem', {
      id,
    });
  }
}
module.exports = CodesystemEndpoint;
