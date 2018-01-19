import Promisizer from "./Promisizer";

export default class UploadEndpoint {
  constructor() {}

  static insertUpload(upload) {
    var apiMethod = gapi.client.qdacity.upload.insertUpload(upload);
    return Promisizer.makePromise(apiMethod);
  }
}
