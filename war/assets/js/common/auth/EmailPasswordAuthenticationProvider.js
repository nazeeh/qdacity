import jwt_decode from 'jwt-decode';


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
					_this.authStateChaned();
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
		const _this = this;
		const promise = new Promise(function(resolve, reject) {
			const decoded = jwt_decode(_this.jwtToken);
			const profile = {
				name: decoded.name,
				email: decoded.email,
				thumbnail: _this.generateThumbnailBase64(decoded.name.charAt(0))
			};
			resolve(profile);
		});
		return promise;
	}

	/**
	 * Generates a thumbnail image with blue background and the letter written in white.
	 * @param {String} letter 
	 * @returns {String} data url
	 */
	generateThumbnailBase64(letter) {
		const canvas = document.createElement('canvas');
		canvas.width = 200;
		canvas.height = 200;
		canvas.style.backgroundColor = 'red';
		return canvas.toDataURL();
	}

	/**
	 * Checks if there is an logged-in user.
	 * @return {boolean}
	 */
	isSignedIn() {
		if(this.jwtToken == undefined || this.jwtToken == null) {
			this.loadTokenFromStorage();
			if(this.jwtToken == undefined || this.jwtToken == null) {
				return false
			}
		}
		return this.isTokenValid(this.jwtToken);
	}

	/**
	 * Tries to load a jwt token from storage.
	 * Sets this.jwtToken to the found token.
	 */
	loadTokenFromStorage() {
		// TODO
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
		this.authStateChaned();

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
		if(this.jwtToken == undefined || this.jwtToken == null) {
			this.loadTokenFromStorage();
		}
		if(this.isTokenValid(this.jwtToken)) {
			return this.jwtToken;
		} else {
			return undefined;
		}
	}

	/**
	 * Always calls the given callback if the auth state changes.
	 *
	 * @param {Function} callback
	 */
	addAuthStateListener(callback) {
		this.callbackFunctions.push(callback);
	}

	authStateChaned() {
		for(const callback of this.callbackFunctions) {
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