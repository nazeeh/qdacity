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
evaluateRevision(revId, name, docs){
	  
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.validation.evaluateRevision({'revisionID': revId, 'name': name, 'docs': docs}).execute(function(resp) {
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

static getProjectStats(prjID, prjType){
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.project.getProjectStats({'id': prjID, 'projectType': prjType}).execute(function(resp) {
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

static getProject(prjID, prjType){
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.project.getProject({'id': prjID, 'type':prjType}).execute(function(resp) {
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


static listRevisions(prjID){
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.project.listRevisions({'projectID': prjID}).execute(function(resp) {
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

static inviteUser(prjID, userEmail){
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.project.inviteUser({'projectID' : prjID, 'userEmail': userEmail}).execute(function(resp) {
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

static createSnapshot(prjID, comment){
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.project.createSnapshot({'projectID': prjID, 'comment' : comment}).execute(function(resp) {
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