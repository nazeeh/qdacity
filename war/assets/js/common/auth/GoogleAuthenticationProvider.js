//@ts-check
import * as AuthenticationNetworks from './AuthenticationNetworks.js';
import HelloJsAuthenticationProvider from './HelloJsAuthenticationProvider.js';

import AuthenticationEndpoint from '../endpoints/AuthenticationEndpoint.js';

const GOOGLE_CLIENT_ID = '$CLIENT_ID$';
const GOOGLE_SCOPES =
	'https://www.googleapis.com/auth/userinfo.profile, https://www.googleapis.com/auth/userinfo.email';

export default class GoogleAuthenticationProvider extends HelloJsAuthenticationProvider {
	constructor(qdacityTokenAuthentcationProvider) {
		const registerApiMethod = AuthenticationEndpoint.registerGoogle;
		const getTokenApiMethod = AuthenticationEndpoint.getTokenGoogle;
		super(
			qdacityTokenAuthentcationProvider,
			registerApiMethod,
			getTokenApiMethod,
			AuthenticationNetworks.GOOGLE
		);

		this.qdacityTokenAuthentcationProvider = qdacityTokenAuthentcationProvider;

		// gapi auth2 is used for silent sign-in
		this.auth2 = gapi.auth2.init({
			client_id: GOOGLE_CLIENT_ID,
			scope: 'profile'
		});
	}

	/**
	 * Signs-in on an google account silently.
	 * @returns {Promise} the google profile
	 */
	async silentSignIn() {
		const _this = this;
		const promise = new Promise(function(resolve, reject) {
			_this.auth2.isSignedIn.listen(function(googleUser) {
				console.log('Signed in with google silently');

				// get google token
				const googleToken = _this.auth2.currentUser.get().getAuthResponse()
					.id_token;

				// get qdacity jwt token
				AuthenticationEndpoint.getTokenGoogle(googleToken)
					.then(function(resp) {
						_this.qdacityTokenAuthentcationProvider.setToken(resp.value);
						_this.qdacityTokenAuthentcationProvider.authStateChaned();

						// get profile
						const gapiProfile = _this.auth2.currentUser.get().getBasicProfile();
						const profile = {
							name: gapiProfile.getName(),
							email: gapiProfile.getEmail(),
							thumbnail: gapiProfile.getImageUrl()
						};
						resolve(profile);
					})
					.catch(function(resp) {
						reject(resp);
					});
			});

			// timeout because listening to an observer
			setTimeout(function() {
				console.log('Could not sign in with google silently');
				reject('Could not sign in with google silently');
			}, 2000);
		});
		return promise;
	}

	/**
	 * Signs in with a popup.
	 * @returns {Promise}
	 * If the sign-in was successful (Google + Qdacity), then the Google profile is resolved.
	 * If the sign-in for Google was not successful (Qdacity automatically also failed), the error is rejeceted.
	 * If the sign-in for Google succeeded but for Qdacity not, then the Google profile is rejected.
	 */
	signIn() {
		const signInProperties = {
			display: 'popup',
			response_type: 'token id_token',
			scope: GOOGLE_SCOPES,
			force: true // let user choose which account he wants to login with
		};
		return super.signIn(signInProperties);
	}

	addAuthStateListener(callback) {
		super.addAuthStateListener(callback);

		// add to gapi
		this.auth2.currentUser.listen(callback);
	}

	signOut() {
		const _this = this;
		const superSignoutPromise = super.signOut();
		const promise = new Promise(async function(resolve, reject) {
			try {
				_this.auth2.disconnect();
				await superSignoutPromise;
			} catch (e) {
				console.log('Signout with Google: catched exception');
				console.log(e);
			}
			resolve();
		});
		return promise;
	}
}
