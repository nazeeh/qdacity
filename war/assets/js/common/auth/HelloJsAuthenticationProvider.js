//@ts-check
import hello from 'hellojs';

import * as AuthenticationNetworks from './AuthenticationNetworks.js';
import UserEndpoint from '../endpoints/UserEndpoint.js';
import ImageUtil from './ImageUtil.js';

const GOOGLE_CLIENT_ID = '$CLIENT_ID$';
const TWITTER_CLIENT_ID = '$TWITTER_CLIENT_ID$';


// hellojs for 'regular' sign-in
hello.init({
	google: GOOGLE_CLIENT_ID,
	twitter: TWITTER_CLIENT_ID
}, {
    redirect_uri: '$APP_PATH$',
	oauth_proxy: 'https://auth-proxy-dot-qdacity-app.appspot.com/oauthproxy'
});

export default class HelloJsAuthenticationProvider {

    constructor(qdacityTokenAuthentcationProvider,
                registerApiMethod,
                getTokenApiMethod,
                authNetwork) {
        this.qdacityTokenAuthentcationProvider = qdacityTokenAuthentcationProvider;
        this.registerApiMethod = registerApiMethod;
        this.getTokenApiMethod = getTokenApiMethod;
        this.authNetwork = authNetwork;

        this.signOut = this.signOut.bind(this);
    }


	/**
	 * Registers the current user.
	 * The user has to be logged in beforehand.
	 * Signs-in after successful registering.
	 * @param givenName
	 * @param surName
	 * @param email
	 * @returns {Promise}
	 */
	registerCurrentUser(givenName, surName, email) {
        const _this = this;

		var promise = new Promise(function(resolve, reject) {

            // get AuthNetwork token
			const session = hello.getAuthResponse(_this.authNetwork);
			let authNetworkToken = session.id_token;
			if(!authNetworkToken) {
				// twitter needs access token
				authNetworkToken = session.access_token;
			}

			_this.registerApiMethod({
                authNetworkToken: authNetworkToken,
                email: email,
                surName: surName,
                givenName: givenName
            }).execute(function(resp) {
				if (!resp.code) {
					// sign in after successful registration
                    _this.getTokenApiMethod({
                        authNetworkToken: authNetworkToken,
                    }).execute(async function(resp) {
                        if (!resp.code) {
                            _this.qdacityTokenAuthentcationProvider.setToken(resp.value);
							_this.qdacityTokenAuthentcationProvider.authStateChaned();

							await _this.uploadProfileImg();
							await _this.qdacityTokenAuthentcationProvider.forceTokenRefresh();
                            resolve();
                        } else {
                            reject("Could not sign-in after registering new user.");
                        }
                    });
				} else {
					reject(resp);
				}
			});
		});

		return promise;
	}

	uploadProfileImg() {
        const _this = this;

		var promise = new Promise(async function(resolve, reject) {
			const profile = await hello(_this.authNetwork).api('me');

			// Removing size affecting query parameters from URL.
			var url = URI(profile.thumbnail).fragment(true);
			const picSrcWithoutParams = url.protocol() + '://' + url.hostname() + url.path();

			const imgBase64 = await ImageUtil.scaleToBase64(picSrcWithoutParams, 200, 200);
			const imgBase64WithoutMetaInformation = imgBase64.split(',')[1];
			const data = {
				blob: imgBase64WithoutMetaInformation
			}

			UserEndpoint.updateProfileImg(data).then(async function(resp) {
				if(!resp.code) {
					console.log('changed user profile picture');
				} else {
					console.log('could not change user profile picture');
				}
				resolve();
			});
		});
		return promise;
	}

	/**
	 * Signs in with a popup.
	 * @returns {Promise}
	 * If the sign-in was successful (AuthNetwork + Qdacity), then the AuthNetwork profile is resolved.
	 * If the sign-in for AuthNetwork was not successful (Qdacity automatically also failed), the error is rejeceted.
	 * If the sign-in for AuthNetwork succeeded but for Qdacity not, then the AuthNetwork profile is rejected.
	 */
	signIn(signInProperties) {
        const _this = this;
		const promise = new Promise(function(resolve, reject) {
			hello.on('auth.login', function(auth) {

                // get AuthNetwork token
                const session = hello.getAuthResponse(_this.authNetwork);
				let authNetworkToken = session.id_token;
				if(!authNetworkToken) {
					// twitter needs access token
					authNetworkToken = session.access_token;
				}

                // get qdacity jwt token
                _this.getTokenApiMethod({
                    authNetworkToken: authNetworkToken,
                }).execute(async function(resp) {
                    if (!resp.code) {
                        _this.qdacityTokenAuthentcationProvider.setToken(resp.value);
                        _this.qdacityTokenAuthentcationProvider.authStateChaned();

                        // get profile
                        const profile = await hello(_this.authNetwork).api('me');
                        resolve(profile);
                    } else {
                        // get profile
                        const profile = await hello(_this.authNetwork).api('me');
                        reject(profile);
                    }
                });
			});

			hello(_this.authNetwork)
				.login(signInProperties)
				.then(
					function() {
						// do nothing because the listener gets the result.
					},
					function(err) {
						console.log(err);
						reject(err);
					}
				);
		});
		return promise;
    }

    addAuthStateListener(callback) {
		// add to hellojs
        hello.on('auth', callback);
    }

    signOut() {
        const _this = this;

		const promise = new Promise(async function(resolve, reject) {
			try {
                hello(_this.authNetwork).logout();
            } catch (e) {
				console.log('Signout with ' + _this.authNetwork + ': catched exception');
				console.log(e);
			}
			resolve();
		});
		return promise;
    }

}