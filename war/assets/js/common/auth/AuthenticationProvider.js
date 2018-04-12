//@ts-check
import hello from 'hellojs';

import IntlProvider from '../Localization/LocalizationProvider';

import * as AuthenticationNetworks from './AuthenticationNetworks.js';
import EmailPasswordAuthenticationProvider from './EmailPasswordAuthenticationProvider.js';
import GoogleAuthenticationProvider from './GoogleAuthenticationProvider.js';
import QdacityTokenAuthenticationProvider from './QdacityTokenAuthenticationProvider';


const TOKEN_REFRESH_ATER_MINUTES = 10;


/* ------------------------------- AuthenticationProvider ----------------------------------- */
export default class AuthenticationProvider {
	constructor() {
		

		this.qdacityTokenAuthenticationProvider = new QdacityTokenAuthenticationProvider();
		this.emailPasswordAuthenticationProvider = new EmailPasswordAuthenticationProvider(this.qdacityTokenAuthenticationProvider);
		this.googleAuthenticationProvider = new GoogleAuthenticationProvider(this.qdacityTokenAuthenticationProvider);

		this.network = {
			google: AuthenticationNetworks.GOOGLE, // uses hellojs
			google_silent: AuthenticationNetworks.GOOGLE_SILENT, // uses gapi.auth2
			email_password: AuthenticationNetworks.EMAIL_PASSWORD // uses EmailPasswordAuthenticationProvider
		};

		/**
		 * The active network.
		 * Equals one of the network properties or 'gapi'.
		 */
		this.activeNetwork = this.network.google;

		const _this = this;
		setInterval(function() {
			const { formatMessage } = IntlProvider.intl;
			// automatically refresh token
			console.log('automatically refreshing token');
			if(_this.isSignedIn()) {
				_this.getToken(); // refreshes if neccessary
				
				if(!_this.isSignedIn()) {
					vex.dialog.open({
						message: formatMessage({
							id: 'authenticationProvider.automaticTokenRefresh.failed',
							defaultMessage: 'Authentication Error. Please reload the page and sign-in again.'
						}),
						buttons: [
							$.extend({}, vex.dialog.buttons.YES, {
								text: formatMessage({
									id: 'authenticationProvider.automaticTokenRefresh.close',
									defaultMessage: 'Close'
								})
							})
						],
					});
				}
			}

		}, 60 * 1000 * TOKEN_REFRESH_ATER_MINUTES); // every 10 min
	}

	/**
	 * Signs-in on google account via a popup.
	 * Signs out all accounts beforehand!
	 * @return {Promise} 
	 * If the sign-in was successful (Google + Qdacity), then the google profile is resolved.
	 * If the sign-in for Google was not successful (Qdacity automatically also failed), the error is rejeceted.
	 * If the sign-in for Google succeeded but for Qdacity not, then the google profile is rejected.
	 */
	async signInWithGoogle() {
		this.signOut();
		const _this = this;
		const promise = new Promise(async function(resolve, reject) {
			try {
				const googleProfile = await _this.googleAuthenticationProvider.signIn();
				_this.activeNetwork = _this.network.google;
				_this.synchronizeTokenWithGapi();
				resolve(googleProfile);
			} catch (e) {
				reject(e);
			}
		});
		return promise;
	}

	/**
	 * Signs-in on an google account silently.
	 * Sets the activeNetwork to 'gapi'.
	 * @returns {Promise} the google profile, if signing in to google+ worked (independent from user being registered at qdacity)
	 */
	silentSignInWithGoogle() {
		var _this = this;
		const promise = new Promise(async function(resolve, reject) {
			try {
				const googleProfile = await _this.googleAuthenticationProvider.silentSignIn(); 
				_this.activeNetwork = _this.network.google_silent;
				_this.synchronizeTokenWithGapi();
				resolve(googleProfile);
			} catch (e) {
				reject(e);
			}
		});
		return promise;
	}

	/**
	 * Signs-in on the qdacity account with email and password.
	 * Signs out all accounts beforehand!
	 * @param {String} email 
	 * @param {String} password 
	 * @returns {Promise}
	 */
	async signInWithEmailPassword(email, password) {
		this.signOut();
		const signinResult = await this.emailPasswordAuthenticationProvider.signIn(email, password);
		this.activeNetwork = this.network.email_password;
		this.synchronizeTokenWithGapi();
		return signinResult;
	}

	/**
	 * Tries to restore token from prior session.
	 * @returns {Promise}
	 */
	async silentSignInWithQdacityToken() {
		const _this = this;
		const promise = new Promise(async function(resolve, reject) {
			if(_this.qdacityTokenAuthenticationProvider.isSignedIn()) { // tries to restore token
				_this.activeNetwork = _this.network.email_password;
				await _this.synchronizeTokenWithGapi();
				_this.qdacityTokenAuthenticationProvider.authStateChaned(); // has to be called after sync with gapi
				console.log('Signed in with email+pwd silently');
				resolve(true);
			} else {
				console.log('Could not sign in with email+pwd silently');
				reject('Could not sign in with email+pwd silently');
			}
		});
		return promise;
	}

	/**
	 * Get the current user.
	 * Respects the activeNetwork state to achieve this.
	 * @return {Promise}
	 */
	getProfile() {
		return this.qdacityTokenAuthenticationProvider.getProfile();
	}

	/**
	 * Checks if there is an logged-in user.
	 * Respects the activeNetwork state to achieve this.
	 * @return {boolean}
	 */
	isSignedIn() {
		return this.qdacityTokenAuthenticationProvider.isSignedIn();
	}

	/**
	 * Tries to sign out the current user.
	 * Uses both methods to try to log out.
	 * The returned Promise is the one of the activeNetwork state.
	 * @return {Promise}
	 */
	async signOut() {
		const _this = this;
		const promise = new Promise(async function(resolve, reject) {
			try {
				await _this.googleAuthenticationProvider.signOut();
				await _this.qdacityTokenAuthenticationProvider.signOut();
			} catch (e) {
				console.log('Signout: catched exception');
				console.log(e);
			}

			// invalidate token in gapi.client
			gapi.client.setToken({
				access_token: ''
			});

			resolve();
		});
		return promise;
	}

	/**
	 * Get the auth token (id_token)
	 * @returns the token
	 */
	getToken() {
		return this.qdacityTokenAuthenticationProvider.getToken();
	}

	/** 
	 * This returns the matching format for the authorization header.
	 * Format: <token> <identity_provider> 
	 * 'Bearer' has to be prepended!
	 */
	getEncodedToken() {
		return this.encodeTokenWithIdentityProvider(
			this.getToken()
		);
	}

	/**
	 * Always calls the given callback if the auth state changes.
	 *
	 * @param callback
	 */
	addAuthStateListener(callback) {
		// add to jwt token listener
		this.qdacityTokenAuthenticationProvider.addAuthStateListener(callback);

		this.googleAuthenticationProvider.addAuthStateListener(callback);
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
			const headerToken = _this.getEncodedToken();
			gapi.client.setToken({
				access_token: headerToken // gapi prepends 'Bearer ' automatically!
			});
			resolve();
		});
		return promise;
	}

	/**
	 * Encodes the token with federate identity provider information.
	 * This is a workaround because gapi.client doesn't provider header
	 * specification with the discovered API.
	 * @param {String} token
	 * @returns the ecoded token as string.
	 */
	encodeTokenWithIdentityProvider(token) {
		return token + ' qdacity-custom';
	}

	/**
	 * Tries to register a user with email and password at qdacity.
	 * @param {String} email 
	 * @param {String} password 
	 * @param {String} givenName 
	 * @param {String} surName 
	 */
	registerUserEmailPassword(email, password, givenName, surName) {
		return this.emailPasswordAuthenticationProvider.register(email, password, givenName, surName);
	}

	/**
	 * Registers the current google user.
	 * The user has to be logged in beforehand.
	 * Signs-in after successful registering.
	 * @param givenName
	 * @param surName
	 * @param email
	 * @returns {Promise}
	 */
	registerGoogleUser(givenName, surName, email) {
		return this.googleAuthenticationProvider.registerCurrentUser(givenName, surName, email);
	}

	/**
	 * @returns {String}
	 */
	getActiveNetwork() {
		return this.activeNetwork;
	}

	/**
	 * Forces a token refresh.
	 * This also updates the profile of the user.
	 * @returns {Promise}
	 */
	refreshSession() {
		return this.qdacityTokenAuthenticationProvider.forceTokenRefresh();
	}

	/* ---------------------- Interaction with Qdacity Server ................. */

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
