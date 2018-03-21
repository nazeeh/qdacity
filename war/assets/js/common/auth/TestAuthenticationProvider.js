export default class TestAuthenticationProvider {

	constructor() {
		this.isSignedIn = false;
	}


	signIn() {
		const _this = this;
		const promise = new Promise(function(resolve, reject) {
			_this.isSignedIn = true;
			resolve();
		});
		return promise;
	}

	signOut() {
		const _this = this;
		const promise = new Promise(function(resolve, reject) {
			_this.isSignedIn = false;
			resolve();
		});
		return promise;
	}

	isSignedIn() {
		return this.isSignedIn;
	}

	getProfile() {
		const _this = this;
		const promise = new Promise(function(resolve, reject) {
			const profile = !_this.isSignedIn ? undefined : {
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
		return this.isSignedIn ? "TEST_TOKEN" : undefined;
	}
}
