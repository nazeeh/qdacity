export default class Account {
  constructor(client_id, scope) {
	  this.auth2 = gapi.auth2.init({
	      client_id: client_id,
	      scope: scope
	  });
  }
 
  
   signin(callbackSucc) {
		this.auth2.signIn().then(callbackSucc); 
	}
   
   
   changeAccount(callback,client_id,scopes){
	   this.auth2.signIn({'prompt':'select_account'}).then(callback); 
  }
   
   getProfile(){
	   return this.auth2.currentUser.get().getBasicProfile();
   }
  
  isSignedIn(){
	  return this.auth2.isSignedIn.get();
  }
  
  getCurrentUser(){
	  var promise = new Promise(
			  function(resolve, reject) {
				  gapi.client.qdacity.user.getCurrentUser().execute(function(resp) {
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
  
  
  registerCurrentUser(givenName, surName, email){
	  var promise = new Promise(
			  function(resolve, reject) {
				  var user = {};
				  user.email = email;
				  user.givenName = givenName;
				  user.surName = surName;
				  
				  gapi.client.qdacity.insertUser(user).execute(function(resp) {
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