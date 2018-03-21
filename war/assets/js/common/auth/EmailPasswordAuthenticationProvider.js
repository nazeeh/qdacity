import jwt_decode from 'jwt-decode';

const STORAGE_EMAIL_PASSWORD_TOKEN_KEY = 'qdacity-emai-password-token';

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
					localStorage.setItem(STORAGE_EMAIL_PASSWORD_TOKEN_KEY, resp.value);
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
	 * Get the current user
	 * @return {Promise}
	 */
	getProfile() {
		const _this = this;
		const promise = new Promise(function(resolve, reject) {
			if(_this.jwtToken === undefined || _this.jwtToken === null) {
				resolve({
					name: '',
					email: '',
					thumbnail: ''
				});
			}
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
		const context = canvas.getContext('2d');
		canvas.width = 200;
		canvas.height = 200;

		// background
		context.fillStyle = "red";
		context.fillRect(0, 0, canvas.width, canvas.height);

		// letter
		context.fillStyle = "white";
		context.font = "130px Arial";
		context.textAlign = "center";
		context.fillText(letter, canvas.width / 2, canvas.height/2 + 40);

		return canvas.toDataURL();
	}

	/**
	 * Checks if there is an logged-in user.
	 * @return {boolean}
	 */
	isSignedIn() {
		if(this.jwtToken === undefined || this.jwtToken === null) {
			this.loadTokenFromStorage();
		}
		return this.jwtToken !== undefined && this.jwtToken !== null;
	}

	/**
	 * Tries to load a jwt token from storage.
	 * Sets this.jwtToken to the found token.
	 */
	loadTokenFromStorage() {
		const storedToken = localStorage.getItem(STORAGE_EMAIL_PASSWORD_TOKEN_KEY);
		this.jwtToken = storedToken;
		if(this.jwtToken !== undefined && this.jwtToken !== null) {
			this.authStateChaned();
		}
	}

	/**
	 * Tries to sign out the current user.
	 * @return {Promise}
	 */
	signOut() {
		const _this = this;
		const promise = new Promise(function(resolve, reject) {
			localStorage.removeItem(STORAGE_EMAIL_PASSWORD_TOKEN_KEY);
			_this.jwtToken = null;
			_this.authStateChaned();
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
		return this.jwtToken;
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