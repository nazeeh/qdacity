export default class ChangeLogEndpoint {
	constructor() {
	}
 

	static listChangeStats(prjId, prjType){
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.changelog.listChangeStats({'filterType': "project", 'projectID' : prjId, 'projectType' : prjType}).execute(function(resp){
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