import Promisizer from "./Promisizer";

export default class MetaModelEntityEndpoint {
  constructor() {}

  static listEntities(mmId) {
    var apiMethod = gapi.client.qdacity.metaModelEntity.listEntities({
      metaModelId: mmId
    });
    return Promisizer.makePromise(apiMethod);
  }
}
