import hello from 'hellojs';

const GOOGLE_CLIENT_ID = '$CLIENT_ID$';
const GOOGLE_SCOPES =
	'https://www.googleapis.com/auth/userinfo.profile, https://www.googleapis.com/auth/userinfo.email';

/* ------------------------------- AuthenticationProvider ----------------------------------- */
export default class AuthenticationProvider {
	constructor() {
		// gapi auth2 is used for silent sign-in
		this.auth2 = gapi.auth2.init({
			client_id: GOOGLE_CLIENT_ID,
			scope: 'profile'
		});

		this.initHelloJs();

		this.network = {
			google: 'google', // uses hellojs
			google_silent: 'gapi' // uses gapi.auth2
		};

		/**
		 * The active network.
		 * Equals one of the network properties or 'gapi'.
		 */
		this.activeNetwork = this.network.google;
	}

	/**
	 * Inits the HelloJS library
	 */
	initHelloJs() {
		hello.init({
			google: GOOGLE_CLIENT_ID
		});
	}

	/**
	 * Signs-in on google account via a popup.
	 * Sets the activeNetwork to 'google'.
	 * @param callback
	 * @return {Promise}
	 */
	signInWithGoogle() {
		const _this = this;
		const promise = new Promise(function(resolve, reject) {
			hello.on('auth.login', function(auth) {
				_this.activeNetwork = _this.network.google;
				_this.synchronizeTokenWithGapi();
				resolve();
			});

			hello(_this.network.google)
				.login({
					display: 'popup',
					response_type: 'token id_token',
					scope: GOOGLE_SCOPES,
					force: true // let user choose which account he wants to login with
				})
				.then(
					function() {
						// do nothing because the listener  gets the result.
						_this.activeNetwork = _this.network.google;
					},
					function(err) {
						console.log(err);
						reject(err);
					}
				);
		});
		return promise;
	}

	/**
	 * Signs-in on an google account silently.
	 * Sets the activeNetwork to 'gapi'.
	 */
	silentSignInWithGoogle() {
		var _this = this;
		const promise = new Promise(function(resolve, reject) {
			_this.auth2.isSignedIn.listen(function(googleUser) {
				_this.activeNetwork = _this.network.google_silent;
				resolve();
			});
		});
		return promise;
	}

	/**
	 * Get the current user.
	 * Respects the activeNetwork state to achieve this.
	 * @return {Promise}
	 */
	getProfile() {
		if (this.activeNetwork !== this.network.google_silent) {
			// check hellojs
			return hello(this.activeNetwork).api('me');
		} else {
			// elsewise check gapi.auth2
			var _this = this;
			const promise = new Promise(function(resolve, reject) {
				const gapiProfile = _this.auth2.currentUser.get().getBasicProfile();
				const profile = {
					name: gapiProfile.getName(),
					email: gapiProfile.getEmail(),
					thumbnail: gapiProfile.getImageUrl()
				};
				resolve(profile);
			});
			return promise;
		}
	}

	/**
	 * Checks if there is an logged-in user.
	 * Respects the activeNetwork state to achieve this.
	 * @return {boolean}
	 */
	isSignedIn() {
		if (this.activeNetwork !== this.network.google_silent) {
			// check hellojs
			const session = hello.getAuthResponse(this.network.google);
			const currentTime = new Date().getTime() / 1000;
			return session && session.access_token && session.expires > currentTime;
		} else {
			// elsewise check gapi.auth2
			return this.auth2.isSignedIn.get();
		}
	}

	/**
	 * Tries to sign out the current user.
	 * Uses both methods to try to log out.
	 * The returned Promise is the one of the activeNetwork state.
	 * @return {Promise}
	 */
	signOut() {
		if (this.activeNetwork !== this.network.google_silent) {
			this.auth2.disconnect();
			// check hellojs
			return hello(this.network.google).logout();
		} else {
			hello(this.network.google).logout();
			// elsewise check gapi.auth2
			return this.auth2.disconnect();
		}
	}

	/**
	 * Loggs out the current user and starts the sign in process for a new user.
	 *
	 * @param callback
	 * @returns {Promise}
	 */
	changeAccount() {
		var _this = this;
		var promise = new Promise(function(resolve, reject) {
			_this.signOut().then(
				function() {
					_this.signInWithGoogle().then(
						function() {
							resolve();
						},
						function(err) {
							console.log('Error at changing Account!');
							reject(err);
						}
					);
				},
				function(err) {
					console.log('Error at changing Account!');
					reject(err);
				}
			);
		});
		return promise;
	}

	/**
	 * Get the auth token (id_token)
	 * @returns the token
	 */
	getToken() {
		if (this.activeNetwork !== this.network.google_silent) {
			// check hellojs
			const session = hello.getAuthResponse(this.network.google);
			return session.id_token;
		} else {
			// elsewise check gapi.auth2
			return this.auth2.currentUser.get().getAuthResponse().id_token;
		}
	}

	/**
	 * Always calls the given callback if the auth state changes.
	 *
	 * @param callback
	 */
	addAuthStateListener(callback) {
		// add to hellojs
		hello.on('auth', callback);

		// add to gapi.auth2
		this.auth2.currentUser.listen(callback);
	}

	/**
	 * Gets the newest id token and provides the gapi with it.
	 * Respects the activeNetwork state to achieve this.
	 * @return {Promise}
	 */
	synchronizeTokenWithGapi() {
		const _this = this;
		const promise = new Promise(function(resolve, reject) {
			if (!_this.isSignedIn()) {
				reject();
				return;
			}

			const idToken = _this.getToken();
			const headerToken = _this.encodeTokenWithIdentityProvider(
				idToken,
				_this.network.google
			); // format: <id_token> <authentication_provider_identifier>
			// Google just allows Authorization header customization with id_token by using the access_token attribute:
			gapi.client.setToken({
				access_token: headerToken // gapi prepends 'Bearer ' automatically!
			});
		});
		return promise;
	}

	/**
	 * Encodes the token with federate identity provider information.
	 * This is a workaround because gapi.client doesn't provider header
	 * specification with the discovered API.
	 * @param {String} token
	 * @param {Atring} provider
	 * @returns the ecoded token as string.
	 */
	encodeTokenWithIdentityProvider(token, provider) {
		return token + ' ' + provider;
	}

	/* ---------------------- Interaction with Qdacity Server ................. */

	/**
	 * Registers the current user.
	 * The user has to be logged in beforehand.
	 *
	 * @param givenName
	 * @param surName
	 * @param email
	 * @returns {Promise}
	 */
	registerCurrentUser(givenName, surName, email) {
		var promise = new Promise(function(resolve, reject) {
			var user = {};
			user.email = email;
			user.givenName = givenName;
			user.surName = surName;

			gapi.client.qdacity.insertUser(user).execute(function(resp) {
				if (!resp.code) {
					resolve(resp);
				} else {
					reject(resp);
				}
			});
		});

		return promise;
	}

	/**
	 * Gets the current user from qdacity server.
	 *
	 * @returns {Promise}
	 */
	getCurrentUser() {
		var promise = new Promise(function(resolve, reject) {
			gapi.client.qdacity.user.getCurrentUser().execute(function(resp) {
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