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
  
  //FIXME move to validationEndpoint
evaluateRevision(revId, name){
	  
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.validation.evaluateRevision({'revisionID': revId, 'name': name}).execute(function(resp) {
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

static setDescription(prjId, projectType, description){
	  
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.project.setDescription({'projectID': prjId, 'projectType': projectType, 'description': description}).execute(function(resp) {
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