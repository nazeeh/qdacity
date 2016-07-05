class ProjectEndpoint {
  constructor() {
  }
 
  deleteRevision(revisionId){
	  
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.project.removeProjectRevision({'id': revisionId}).execute(function(resp) {
			       	 if (!resp.code) {
			       		resolve(resp);
			       	 }
			       
			       	 else{
			       		reject(resp);
			       	}
			  });
		  }
	  );
	  
	  return promise;
  }
}