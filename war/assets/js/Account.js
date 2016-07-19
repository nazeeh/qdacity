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
	   this.auth2.getAuthInstance().signIn({'prompt':'select_account'}).then(callback); 
  }
   
   getProfile(){
	   return this.auth2.currentUser.get().getBasicProfile();
   }
  
  isSignedIn(){
	  return this.auth2.isSignedIn.get();
  }
}  