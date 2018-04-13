//@ts-check

export default class EmailPasswordAuthenticationProvider {

	constructor(qdacityTokenAuthentcationProvider) {
		this.qdacityTokenAuthentcationProvider = qdacityTokenAuthentcationProvider;
	}

	/** 
	 * Signs in with the given credentials.
	 * @param email
	 * @param password
	 * @returns {Promise} 
	 */
	signIn(email, password) {
		const _this = this;
		var promise = new Promise(function(resolve, reject) {
			gapi.client.qdacity.authentication.email.getToken({
				email: email,
				pwd: password
			}).execute(function(resp) {
				if (!resp.code) {
					_this.qdacityTokenAuthentcationProvider.setToken(resp.value);
					_this.qdacityTokenAuthentcationProvider.authStateChaned();
					resolve(resp);
				} else {
					reject(resp);
				}
			});
		});
		return promise;
	}

	/**
	 * Registers a user.
	 * @param givenName
	 * @param surName
	 * @param email
	 * @param password
	 * @returns {Promise}
	 */
	register(email, password, givenName, surName) {
		
		var promise = new Promise(function(resolve, reject) {
			gapi.client.qdacity.authentication.email.register({
				givenName: givenName,
				surName: surName,
				email: email,
				pwd: password
			}).execute(function(resp) {
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