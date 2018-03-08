
import AuthenticationProvider from './AuthenticationProvider.js';

export default class TestAuthenticationProvider extends AuthenticationProvider {

	isSignedIn() {
		return true;
	}

	synchronizeTokenWithGapi() {
		const promise = new Promise(function(resolve, reject) {
			resolve();
		});
		return promise;
	}
}
