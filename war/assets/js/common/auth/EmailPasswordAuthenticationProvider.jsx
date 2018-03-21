//@ts-check
export default class EmailPasswordAuthenticationProvider {

	constructor() {
	
		this.callbackFunctions = [];
		this.jwtToken = null;
	}

	/** 
	 * Signs in with the given credentials.
	 * @param email
	 * @param password
	 * @returns {Promise} 
	 */
	signIn(email, password) {
		const _this = this;
		var promise = new Promise(function(resolve, reject) {
			gapi.client.qdacity.authentication.getTokenEmailPassword({
				email: email,
				pwd: password
			}).execute(function(resp) {
				if (!resp.code) {
					_this.jwtToken = resp.value;
					console.log('received token ' + _this.jwtToken);
					resolve(resp);
				} else {
					reject(resp);
				}
			});
		});
		return promise;
	}

	/**
	 * Get the current user.
	 * @return {Promise}
	 */
	getProfile() {
		// TODO
		const promise = new Promise(function(resolve, reject) {
			resolve();
		});
		return promise;
	}

	/**
	 * Checks if there is an logged-in user.
	 * @return {boolean}
	 */
	isSignedIn() {
		if(this.jwtToken == undefined || this.jwtToken == null) {
			return false;
		}
		return this.isTokenValid(this.jwtToken);
	}

	/**
	 * Checks if the given token is valid and not expired.
	 * @param {String} token 
	 * @returns {boolean}
	 */
	isTokenValid(token) {
		// TODO!
		return true;
	}

	/**
	 * Tries to sign out the current user.
	 * @return {Promise}
	 */
	signOut() {
		this.jwtToken = null;

		const promise = new Promise(function(resolve, reject) {
			resolve();
		});
		return promise;
	}

	/**
	 * Get the auth token (JWT token)
	 * @returns the token
	 */
	getToken() {
		if(this.isTokenValid(this.jwtToken)) {
			return this.jwtToken;
		} else {
			return undefined;
		}
	}

	/**
	 * Always calls the given callback if the auth state changes.
	 *
	 * @param callback
	 */
	addAuthStateListener(callback) {
		this.callbackFunctions.push(callback);
	}

	authStateChaned() {
		for(const callback in this.callbackFunctions) {
			callback();
		}
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