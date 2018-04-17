//@ts-check
import * as AuthenticationNetworks from './AuthenticationNetworks.js';
import HelloJsAuthenticationProvider from './HelloJsAuthenticationProvider.js';

export default class TwitterAuthenticationProvider extends HelloJsAuthenticationProvider {

	constructor(qdacityTokenAuthentcationProvider) {
		const registerApiMethod = gapi.client.qdacity.authentication.twitter.register;
		const getTokenApiMethod = gapi.client.qdacity.authentication.twitter.getToken;
		super(qdacityTokenAuthentcationProvider, registerApiMethod, getTokenApiMethod, AuthenticationNetworks.TWITTER);

		this.qdacityTokenAuthentcationProvider = qdacityTokenAuthentcationProvider;
    }

	/** 
	 * Signs in with a popup.
	 * @returns {Promise} 
	 * If the sign-in was successful (Twitter + Qdacity), then the Twitter profile is resolved.
	 * If the sign-in for Twitter was not successful (Qdacity automatically also failed), the error is rejeceted.
	 * If the sign-in for Twitter succeeded but for Qdacity not, then the Twitter profile is rejected.
	 */
	signIn() {
		const signInProperties = {
			display: 'popup',
			response_type: 'token id_token',
			scope: 'basic, email',
			force: true // let user choose which account he wants to login with
		};
		return super.signIn(signInProperties);
	}
}