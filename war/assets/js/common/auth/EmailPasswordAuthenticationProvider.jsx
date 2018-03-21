export default class EmailPasswordAuthenticationProvider {

	constructor() {
		
	}

	/** 
	 * Signs in with the given credentials.
	 * @param email
	 * @param password
	 * @returns {Promise} 
	 */
	signIn(email, password) {

	}

	/**
	 * Get the current user.
	 * @return {Promise}
	 */
	getProfile() {
		
	}

	/**
	 * Checks if there is an logged-in user.
	 * @return {boolean}
	 */
	isSignedIn() {
		
	}

	/**
	 * Tries to sign out the current user.
	 * @return {Promise}
	 */
	signOut() {
		
	}

	/**
	 * Get the auth token (JWT token)
	 * @returns the token
	 */
	getToken() {
		
	}

	/**
	 * Always calls the given callback if the auth state changes.
	 *
	 * @param callback
	 */
	addAuthStateListener(callback) {

	}

	/**
	 * Registers a user.
	 * @param givenName
	 * @param surName
	 * @param email
	 * @param password
	 * @returns {Promise}
	 */
	register(email, password, givenName, surName) {
		
		var promise = new Promise(function(resolve, reject) {
			gapi.client.qdacity.authentication.registerEmailPassword({
				givenName: givenName,
				surName: surName,
				email: email,
				pwd: password
			}).execute(function(resp) {
				if (!resp.code) {
					resolve(resp);
				} else {
					reject(resp);
				}
			});
		});
		return promise;
	}
}