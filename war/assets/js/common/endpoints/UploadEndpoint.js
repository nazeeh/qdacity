export default class UploadEndpoint {
  constructor() {
  }

  static insertUpload(upload){
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.upload.insertUpload(upload).execute(function(resp) {
			       	 if (!resp.code) {
			       		resolve(resp);
			       	 }
			       	 else{
			       		console.log(resp.code + " : " +resp.message);
			       		reject(resp);
			       	}
			  });
		  }
	  );
	  return promise;
  }
  
  
}
