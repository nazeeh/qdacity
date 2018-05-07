//@ts-check
import * as AuthenticationNetworks from './AuthenticationNetworks.js';
import HelloJsAuthenticationProvider from './HelloJsAuthenticationProvider.js';

import AuthenticationEndpoint from '../endpoints/AuthenticationEndpoint.js';

export default class FacebookAuthenticationProvider extends HelloJsAuthenticationProvider {
	constructor(qdacityTokenAuthentcationProvider) {
		const registerApiMethod = AuthenticationEndpoint.registerFacebook;
		const getTokenApiMethod = AuthenticationEndpoint.getTokenFacebook;
		super(
			qdacityTokenAuthentcationProvider,
			registerApiMethod,
			getTokenApiMethod,
			AuthenticationNetworks.FACEBOOK
		);

		this.qdacityTokenAuthentcationProvider = qdacityTokenAuthentcationProvider;
	}

	/**
	 * Signs in with a popup.
	 * @returns {Promise}
	 * If the sign-in was successful (Facebook + Qdacity), then the Facebook profile is resolved.
	 * If the sign-in for Facebook was not successful (Qdacity automatically also failed), the error is rejeceted.
	 * If the sign-in for Facebook succeeded but for Qdacity not, then the Facebook profile is rejected.
	 */
	signIn() {
		const signInProperties = {
			display: 'popup',
			scope: 'basic, email',
			force: true // let user choose which account he wants to login with
		};
		return super.signIn(signInProperties);
	}
}
