import Promisizer from "./Promisizer";

export default class CodesEndpoint {
  constructor() {}

  static updateRelationshipCode(
    relationshipCodeId,
    relationSourceId,
    relationId
  ) {
    var apiMethod = gapi.client.qdacity.codes.updateRelationshipCode({
      relationshipCodeId: relationshipCodeId,
      relationSourceId: relationSourceId,
      relationId: relationId
    });
    return Promisizer.makePromise(apiMethod);
  }

  static updateRelationshipCodeMetaModel(relationshipCodeId, newMetaModelId) {
    var apiMethod = gapi.client.qdacity.codes.updateRelationshipCodeMetaModel({
      relationshipCodeId: relationshipCodeId,
      newMetaModelId: newMetaModelId
    });
    return Promisizer.makePromise(apiMethod);
  }

  static setCodeBookEntry(codeId, codebookEntry) {
    var apiMethod = gapi.client.qdacity.codes.setCodeBookEntry(
      {
        codeId: codeId
      },
      codebookEntry
    );
    return Promisizer.makePromise(apiMethod);
  }

  static getCode(codeId) {
    var apiMethod = gapi.client.qdacity.codes.getCode({
      id: codeId
    });
    return Promisizer.makePromise(apiMethod);
  }

  static addRelationship(srcId, dstId, mmElementId, createIfItExists) {
    if (createIfItExists == null) {
      createIfItExists = true;
    }

    var apiMethod = gapi.client.qdacity.codes.addRelationship(
      {
        sourceCode: srcId,
        createIfItExists: createIfItExists
      },
      {
        codeId: dstId,
        mmElementId: mmElementId
      }
    );
    return Promisizer.makePromise(apiMethod);
  }

  static removeRelationship(codeId, relationshipId) {
    var apiMethod = gapi.client.qdacity.codes.removeRelationship({
      codeId: codeId,
      relationshipId: relationshipId
    });
    return Promisizer.makePromise(apiMethod);
  }

  static removeAllRelationships(id) {
    var apiMethod = gapi.client.qdacity.codes.removeAllRelationships({
      id: id
    });
    return Promisizer.makePromise(apiMethod);
  }
}
