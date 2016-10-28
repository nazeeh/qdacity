export default class ProjectEndpoint {
  constructor() {
  }
 
  listReports(projectId){
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.validation.listReports({'projectID': projectId}).execute(function(resp) {
			       	 if (!resp.code) {
			       		var reportsByRevision = {};
			       		if (typeof resp.items != 'undefined'){
				       		for (var i=0;i<resp.items.length;i++) {
	                    		if (reportsByRevision[resp.items[i].revisionID] === undefined) reportsByRevision[resp.items[i].revisionID] = [];
	                    		reportsByRevision[resp.items[i].revisionID].push(resp.items[i]);
	                        }
			       		}
			       		resolve(reportsByRevision);
			       	 }
			       	 else{
			       		reject(resp);
			       	}
			  });
		  }
	  );
	  
	  return promise;
  }
  
  deleteReport(repId){
	  var promise = new Promise(
			  function(resolve, reject) {
				  gapi.client.qdacity.validation.deleteReport({'reportID': repId}).execute(function(resp) {
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