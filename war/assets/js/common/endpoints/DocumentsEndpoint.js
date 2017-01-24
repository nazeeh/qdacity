export default class DocumentsEndpoint {
  constructor() {
  }
 
  getDocuments(projectId, projectType){
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
}
