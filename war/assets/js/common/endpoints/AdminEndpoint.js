import Promisizer from "./Promisizer";

export default class AdminEndpoint {
  constructor() {}

  static getAdminStats() {
    var apiMethod = gapi.client.qdacity.admin.getAdminStats();
    return Promisizer.makePromise(apiMethod);
  }
}
