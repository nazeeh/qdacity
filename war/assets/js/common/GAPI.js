import Account from './Account.jsx';

var scopes = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
var client_id = '309419937441-6d41vclqvedjptnel95i2hs4hu75u4v7.apps.googleusercontent.com';

export default function loadGAPIs(allLoadedCallback){
	var _this = this;
	var promise = new Promise(
		function(resolve, reject) {
			var account;
			var apisToLoad;
			var callback = function() {
				if (--apisToLoad == 0) {
				   account = ReactDOM.render(<Account  client_id={client_id} scopes={scopes} callback={allLoadedCallback}/>, document.getElementById('accountView'));
				   resolve(account);
				}
			}
			apisToLoad = 2; 
			//Parameters are APIName,APIVersion,CallBack function,API Root
			//gapi.client.load('qdacity', 'v1', callback, 'https://localhost:8888/_ah/api');
			gapi.client.load('qdacity', 'v4', callback, 'https://4-dot-qdacity-quality-metrics.appspot.com/_ah/api'); 
			gapi.load('auth2', callback);
		}
	);
	return promise;
}