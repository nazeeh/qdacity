import Account from './Account.jsx';

var scopes = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
var client_id = '$CLIENT_ID$';
var api_version = '$API_VERSION$';
var api_path = '$API_PATH$';


export default function loadGAPIs(allLoadedCallback) {
	var _this = this;
	var promise = new Promise(
		function (resolve, reject) {
			var account;
			var apisToLoad;
			var callback = function () {
				if (--apisToLoad == 0) {
					resolve({
						client_id: client_id,
						scopes: scopes,
					});
				}
			}
			apisToLoad = 3;
			//Parameters are APIName,APIVersion,CallBack function,API Root
			gapi.client.load('qdacity', api_version, callback, api_path);
			gapi.client.load('qdacityusermigration', api_version, callback, api_path);

			gapi.load('auth2', callback);
		}
	);
	return promise;
}