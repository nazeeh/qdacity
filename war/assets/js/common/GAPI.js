import Account from './Account.jsx';

var scopes = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
var client_id = '309419937441-6d41vclqvedjptnel95i2hs4hu75u4v7.apps.googleusercontent.com';
var api_path = 'https://5-dot-qdacity-app.appspot.com/_ah/api'; //'https://localhost:8888/_ah/api' var api_version = 'v5';

export default function loadGAPIs(allLoadedCallback) {
	var _this = this;
	var promise = new Promise(
		function (resolve, reject) {
			var account;
			var apisToLoad;
			var callback = function () {
				if (--apisToLoad == 0) {
					account = ReactDOM.render(<Account client_id={client_id} scopes={scopes} callback={allLoadedCallback} />, document.getElementById('accountView'));
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