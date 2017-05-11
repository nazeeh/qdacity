import Account from './Account.jsx';

var scopes = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
var client_id = '62776117166-iuu5qlid44hnas1ivvurlr0cku1f0hnc.apps.googleusercontent.com';
var api_path = 'https://1-dot-felix-lo-qdacity.appspot.com/_ah/api'; //'http://localhost:8888/_ah/api'; 
var api_version = 'v1';

export default function loadGAPIs(allLoadedCallback) {
	var _this = this;
	var promise = new Promise(
		function (resolve, reject) {
			var account;
			var apisToLoad;
			var callback = function () {
				if (--apisToLoad == 0) {
					account = ReactDOM.render(<Account  client_id={client_id} scopes={scopes} callback={allLoadedCallback}/>, document.getElementById('accountView'));
					resolve(account);
				}
			}
			apisToLoad = 2;
			//Parameters are APIName,APIVersion,CallBack function,API Root
			gapi.client.load('qdacity', api_version, callback, api_path);
			gapi.load('auth2', callback);
		}
	);
	return promise;
}