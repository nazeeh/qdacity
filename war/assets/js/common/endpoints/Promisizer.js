import AuthenticationProvider from '../AuthenticationProvider';

const authenticationProvider = new AuthenticationProvider();

export default class Promisizer {

	constructor() {}

	static makePromise(apiMethod) {
		var promise = new Promise(
			function (resolve, reject) {
        Promisizer.ensureTokenAvailability().then(function() {
					apiMethod.execute(function (resp) {
						if (!resp.code) {
							resolve(resp);
						} else {
							console.log(resp.code + " : " + resp.message);
							reject(resp);
						}
					});
        }, function() {
        	console.log('Could not make a promise because the token was not available!');
        })
			}
		);

		return promise;
	}

	/**
 	* Ensures that an authentication token is placed in gapi.
	* This call is required in order to load the token after site refreshes.
	* Loads data from cache, so this means not a request each time.
	* @return {Promise}
   	*/
	static ensureTokenAvailability() {
    	return authenticationProvider.synchronizeTokenWithGapi();
	}
}