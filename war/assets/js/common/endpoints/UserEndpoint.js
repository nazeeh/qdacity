export default class ProjectEndpoint {
	constructor() {
	}
 

	static listValidationCoders(prjId){
	  var promise = new Promise(
		  function(resolve, reject) {
			  gapi.client.qdacity.user.listValidationCoders({'validationProject': prjId}).execute(function(resp) {
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
	
	static listUser(prjId){
		  var promise = new Promise(
			  function(resolve, reject) {
				  gapi.client.qdacity.user.listUser({'projectID': prjId}).execute(function(resp) {
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
	
	static listUserNotification(notification){
		  var promise = new Promise(
			  function(resolve, reject) {
				  gapi.client.qdacity.user.listUserNotification().execute(function (resp) {
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
	
	static updateUserNotification(notification){
		  var promise = new Promise(
			  function(resolve, reject) {
				  gapi.client.qdacity.user.updateUserNotification(notification).execute(function (resp) {
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