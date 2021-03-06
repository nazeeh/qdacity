//@ts-check
import jwt_decode from 'jwt-decode';

import AuthenticationEndpoint from '../endpoints/AuthenticationEndpoint.js';

const STORAGE_QDACITY_JWT_TOKEN_KEY = 'qdacity-jwt-token';
const TOKEN_REFRESH_INTERVAL = 30; //min

export default class QdacityTokenAuthenticationProvider {
	constructor() {
		this.callbackFunctions = [];
		this.jwtToken = null;
	}

	/**
	 * Get the current user
	 * @return {Promise}
	 */
	getProfile() {
		const _this = this;
		const promise = new Promise(function(resolve, reject) {
			if (_this.jwtToken === undefined || _this.jwtToken === null) {
				resolve({
					qdacityId: '',
					name: '',
					firstname: '',
					lastname: '',
					email: '',
					thumbnail: '',
					authNetwork: '',
					externalUserId: '',
					externalEmail: ''
				});
			}
			_this.refreshTokenIfNeccessary();
			const decoded = jwt_decode(_this.jwtToken);
			const profile = {
				qdacityId: decoded.sub,
				authNetwork: decoded.auth_network,
				externalUserId: decoded.external_user_id,
				externalEmail: decoded.external_email,
				name: decoded.name,
				firstname: decoded.firstname,
				lastname: decoded.lastname,
				email: decoded.email,
				thumbnail: _this.generateThumbnailBase64(decoded.name)
			};
			resolve(profile);
		});
		return promise;
	}

	/**
	 * Generates a thumbnail image with blue background and the letter written in white.
	 * @param {String} name
	 * @returns {String} data url
	 */
	generateThumbnailBase64(name) {
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		canvas.width = 200;
		canvas.height = 200;

		const colors = ['Red', 'Blue', 'DarkCyan', 'DarkGreen', 'Sienna'];
		const asciiLastChar = name.charCodeAt(name.length - 1);
		const fillStyleColor = colors[asciiLastChar % colors.length];

		// background
		context.fillStyle = fillStyleColor;
		context.fillRect(0, 0, canvas.width, canvas.height);

		// letter
		context.fillStyle = 'white';
		context.font = '130px Arial';
		context.textAlign = 'center';
		context.fillText(name.charAt(0), canvas.width / 2, canvas.height / 2 + 40);

		return canvas.toDataURL();
	}

	/**
	 * Checks if there is an logged-in user.
	 * @return {boolean}
	 */
	isSignedIn() {
		if (this.jwtToken === undefined || this.jwtToken === null) {
			this.loadTokenFromStorage();
		}
		this.refreshTokenIfNeccessary();
		return (
			this.jwtToken !== undefined &&
			this.jwtToken !== null &&
			!this.isTokenExpired(this.jwtToken)
		);
	}

	/**
	 * Tries to load a jwt token from storage.
	 * Sets this.jwtToken to the found token.
	 */
	loadTokenFromStorage() {
		const storedToken = localStorage.getItem(STORAGE_QDACITY_JWT_TOKEN_KEY);
		if (storedToken === undefined || storedToken === null) {
			this.jwtToken = null;
			return;
		}

		if (!this.isTokenExpired(storedToken)) {
			this.jwtToken = storedToken;
		}

		if (this.jwtToken !== undefined && this.jwtToken !== null) {
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
			localStorage.removeItem(STORAGE_QDACITY_JWT_TOKEN_KEY);
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
		if (this.jwtToken == undefined || this.jwtToken == null) {
			this.loadTokenFromStorage();
		}
		this.refreshTokenIfNeccessary();
		return !this.isTokenExpired(this.jwtToken) ? this.jwtToken : null;
	}

	setToken(token) {
		this.jwtToken = token;
		localStorage.setItem(STORAGE_QDACITY_JWT_TOKEN_KEY, token);
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
		for (const callback of this.callbackFunctions) {
			callback();
		}
	}

	/**
	 * Refreshes the token if it is close to timing out.
	 */
	refreshTokenIfNeccessary() {
		if (this.jwtToken == undefined || this.jwtToken == null) {
			return;
		}

		const decoded = jwt_decode(this.jwtToken);

		const now = new Date();
		const compareDate = new Date(
			now.getTime() + TOKEN_REFRESH_INTERVAL * 60000
		); // adding minutes
		const expiresAt = new Date(decoded.exp * 1000); // get the right date format

		if (expiresAt.getTime() < compareDate.getTime()) {
			// refresh neccessary
			this.forceTokenRefresh().catch(e => console.log(e));
		}
	}

	/**
	 * Forces a token refresh
	 * @returns {Promise}
	 */
	forceTokenRefresh() {
		const _this = this;

		const promise = new Promise(function(resolve, reject) {
			AuthenticationEndpoint.refreshToken(_this.jwtToken)
				.then(function(resp) {
					_this.setToken(resp.value);
					console.log('Refreshed token!');
					_this.authStateChaned();
					resolve();
				})
				.catch(function(resp) {
					reject('Refreshing the token failed!');
				});
		});
		return promise;
	}

	/**
	 * Checkis if the token is already expired.
	 * @param {String} token
	 */
	isTokenExpired(token) {
		const decoded = jwt_decode(token);

		const now = new Date();
		const expiresAt = new Date(decoded.exp * 1000); // get the right date format

		return expiresAt.getTime() < now.getTime();
	}
}
