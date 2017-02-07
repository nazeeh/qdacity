export default class CodesystemEndpoint {
	constructor() {
	}
 

	static insertCodeSystem(prjId, prjType){
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.codesystem.insertCodeSystem({'project': prjId, 'projectType': prjType}).execute(function (resp) {
			       	 if (!resp.code && typeof (resp.items != 'undefined')) {
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
	
	static updateCodeSystem(codeSystem){
		  var promise = new Promise(
			  function(resolve, reject) {
				  gapi.client.qdacity.codesystem.updateCodeSystem(codeSystem).execute(function (resp) {
				       	 if (!resp.code && typeof (resp.items != 'undefined')) {
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
	
	static getCodeSystem(codeSystemId){
		  var promise = new Promise(
			  function(resolve, reject) {
				  gapi.client.qdacity.codesystem.getCodeSystem({'id' : codeSystemId }).execute(function(resp) {
				       	 if (!resp.code && typeof (resp.items != 'undefined')) {
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