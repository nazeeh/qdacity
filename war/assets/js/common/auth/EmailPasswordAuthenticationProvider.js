import AuthenticationEndpoint from '../endpoints/AuthenticationEndpoint';

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
			AuthenticationEndpoint.getTokenEmailPwd(email, password)
				.then(function(resp) {
					_this.qdacityTokenAuthentcationProvider.setToken(resp.value);
					_this.qdacityTokenAuthentcationProvider.authStateChaned();
					resolve(resp);
				})
				.catch(function(resp) {
					reject(resp);
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
		return AuthenticationEndpoint.registerEmailPwd(
			email,
			password,
			givenName,
			surName
		);
	}
}
