export default class CodesEndpoint {
	constructor() {
	}
 

	static insertCode(code){
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.codes.insertCode(code).execute(function(resp) {
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
	
	static updateCode(code){
		  var promise = new Promise(
			  function(resolve, reject) {
				  gapi.client.qdacity.codes.updateCode(code).execute(function(resp) {
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
	
	static removeCode(code){
		  var promise = new Promise(
			  function(resolve, reject) {
				  gapi.client.qdacity.codes.removeCode(code).execute(function(resp) {
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
	
	static setCodeBookEntry(codeId, codebookEntry){
		  var promise = new Promise(
			  function(resolve, reject) {
				  gapi.client.qdacity.codes.setCodeBookEntry({'codeId' : getActiveCode().dbID },codeBookEntry).execute(function(resp) {
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
	
	static relocateCode(codeId, newParentId){
		  var promise = new Promise(
			  function(resolve, reject) {
				  gapi.client.qdacity.codes.relocateCode({	'codeId' : codeId, 'newParentID' : newParentId}).execute(function(resp) {
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
	
	static getCode(codeId){
		  var promise = new Promise(
			  function(resolve, reject) {
				  gapi.client.qdacity.codes.getCode({'id' : codeId }).execute(function(resp) {
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