//@ts-check
import hello from 'hellojs';

import * as AuthenticationNetworks from './AuthenticationNetworks.js';
import UserEndpoint from '../endpoints/UserEndpoint.js';
import ImageUtil from './ImageUtil.js';

const GOOGLE_CLIENT_ID = '$CLIENT_ID$';
const GOOGLE_SCOPES =
	'https://www.googleapis.com/auth/userinfo.profile, https://www.googleapis.com/auth/userinfo.email';



export default class GoogleAuthenticationProvider {

	constructor(qdacityTokenAuthentcationProvider) {
		this.qdacityTokenAuthentcationProvider = qdacityTokenAuthentcationProvider;
    
        // hellojs for 'regular' sign-in
        hello.init({
			google: GOOGLE_CLIENT_ID
		}, {
			redirect_uri: '$APP_PATH$'
        });
        
        // gapi auth2 is used for silent sign-in
		this.auth2 = gapi.auth2.init({
			client_id: GOOGLE_CLIENT_ID,
			scope: 'profile'
		});
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

            // get google token
			const session = hello.getAuthResponse(AuthenticationNetworks.GOOGLE);
            const googleToken = session.id_token;

			gapi.client.qdacity.authentication.google.register({
                googleToken: googleToken,
                email: email,
                surName: surName,
                givenName: givenName
            }).execute(function(resp) {
				if (!resp.code) {
					// sign in after successful registration
                    gapi.client.qdacity.authentication.google.getToken({
                        googleToken: googleToken,
                    }).execute(async function(resp) {
                        if (!resp.code) {
                            _this.qdacityTokenAuthentcationProvider.setToken(resp.value);
							_this.qdacityTokenAuthentcationProvider.authStateChaned();
							
							await _this.uploadGoogleProfileImg();
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

	uploadGoogleProfileImg() {
		var promise = new Promise(async function(resolve, reject) {
			const profile = await hello(AuthenticationNetworks.GOOGLE).api('me');

			/*
			* Removing query parameters from URL.
			* With google we always got ?sz=50 in the URL which gives you a
			* small low res thumbnail. Without parameter we get the original
			* image.
			* When adding other LoginProviders this needs to be reviewed
			*/
			var url = URI(profile.thumbnail).fragment(true);
			const picSrcWithoutParams = url.protocol() + '://' + url.hostname() + url.path();

			const imgBase64 = ImageUtil.scaleToBase64(picSrcWithoutParams, 200, 200);
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
	 * Signs in with the google popup.
	 * @returns {Promise} 
	 * If the sign-in was successful (Google + Qdacity), then the google profile is resolved.
	 * If the sign-in for Google was not successful (Qdacity automatically also failed), the error is rejeceted.
	 * If the sign-in for Google succeeded but for Qdacity not, then the google profile is rejected.
	 */
	signIn() {
        const _this = this;
		const promise = new Promise(function(resolve, reject) {
			hello.on('auth.login', function(auth) {

                // get google token
                const session = hello.getAuthResponse(AuthenticationNetworks.GOOGLE);
			    const googleToken = session.id_token;

                // get qdacity jwt token
                gapi.client.qdacity.authentication.google.getToken({
                    googleToken: googleToken,
                }).execute(async function(resp) {
                    if (!resp.code) {
                        _this.qdacityTokenAuthentcationProvider.setToken(resp.value);
                        _this.qdacityTokenAuthentcationProvider.authStateChaned();

                        // get profile
                        const profile = await hello(AuthenticationNetworks.GOOGLE).api('me');
                        resolve(profile);
                    } else {
                        // get profile
                        const profile = await hello(AuthenticationNetworks.GOOGLE).api('me');
                        reject(profile);
                    }
                });
			});

			hello(AuthenticationNetworks.GOOGLE)
				.login({
					display: 'popup',
					response_type: 'token id_token',
					scope: GOOGLE_SCOPES,
					force: true // let user choose which account he wants to login with
				})
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
			    const googleToken = _this.auth2.currentUser.get().getAuthResponse().id_token;

                // get qdacity jwt token
                gapi.client.qdacity.authentication.google.getToken({
                    googleToken: googleToken,
                }).execute(function(resp) {
                    if (!resp.code) {
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
                    } else {
                        reject(resp);
                    }
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
    
    addAuthStateListener(callback) {
		// add to hellojs
        hello.on('auth', callback);
        
        // add to gapi
		this.auth2.currentUser.listen(callback);
    }

    signOut() {
        const _this = this;
		const promise = new Promise(async function(resolve, reject) {
			try {
                _this.auth2.disconnect();
                hello(AuthenticationNetworks.GOOGLE).logout();
            } catch (e) {
				console.log('Signout with Google: catched exception');
				console.log(e);
			}
			resolve();
		});
		return promise;
    }
}