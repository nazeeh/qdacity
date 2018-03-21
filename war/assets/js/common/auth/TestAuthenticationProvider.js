export default class TestAuthenticationProvider {

	signIn() {
		const promise = new Promise(function(resolve, reject) {
			resolve();
		});
		return promise;
	}

	signOut() {
		const promise = new Promise(function(resolve, reject) {
			resolve();
		});
		return promise;
	}

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

	getToken() {
		return "TEST_TOKEN";
	}
}
