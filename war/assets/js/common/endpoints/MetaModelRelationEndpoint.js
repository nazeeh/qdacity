import Promisizer from "./Promisizer";

export default class MetaModelRelationEndpoint {
  constructor() {}

  static listRelations(mmId) {
    var apiMethod = gapi.client.qdacity.metaModelRelation.listRelations({
      metaModelId: mmId
    });
    return Promisizer.makePromise(apiMethod);
  }
}
