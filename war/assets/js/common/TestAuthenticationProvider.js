
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

	getProfile() {
		const promise = new Promise(function(resolve, reject) {
			const profile = {
				name: "Test Name",
				displayName: "Max Mustermann",
				email: "test@qdacity.com",
				thumbnail: ""
			};
			resolve(profile);
		});
		return promise;
	}
}
