export default class ProjectEndpoint {
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
  
  deleteValidationProject(prjId){
	  
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.project.removeValidationProject({'id': prjId}).execute(function(resp) {
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
  
  requestValidationAccess(revId){
	  
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.project.requestValidationAccess({'revisionID': revId}).execute(function(resp) {
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
  
evaluateRevision(revId){
	  
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.project.evaluateRevision({'revisionID': revId}).execute(function(resp) {
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

static setDescription(prjId, description){
	  
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.project.setDescription({'projectID': prjId, 'projectType': 'PROJECT', 'description': description}).execute(function(resp) {
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