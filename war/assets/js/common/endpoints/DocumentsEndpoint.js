export default class DocumentsEndpoint {
  constructor() {
  }
 
  static getDocuments(projectId, projectType){
		var _this = this;
		  var promise = new Promise(
			  function(resolve, reject) {
					gapi.client.qdacity.documents.getTextDocument({'id' : projectId, 'projectType' : projectType}).execute(function(resp) {
						if (!resp.code) {
							resp.items = resp.items || [];
							
							resolve(resp.items);
						} else{
							reject(resp.code);
						}
					});
				}

		  );
		  return promise;
  }
  
  static insertTextDocument(doc){
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.documents.insertTextDocument(doc).execute(function(resp) {
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
  
  static updateTextDocument(doc){
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.documents.updateTextDocument(doc).execute(function(resp) {
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
  
  static removeTextDocument(doc){
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.documents.removeTextDocument(doc).execute(function(resp) {
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
  
  static removeTextDocument(mapId, prjType){
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.documents.getAgreementMaps({'id' : mapId, 'projectType' : prjType}).execute(function(resp) {
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
