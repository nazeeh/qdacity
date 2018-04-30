//@ts-check
import Promisizer from './Promisizer';

export default class AuthenticationEndpoint {
	constructor() {}

	static refreshToken(oldToken) {
		var apiMethod = gapi.client.qdacity.authentication.refreshToken({
			token: oldToken
		});
		return Promisizer.makePromise(apiMethod);
	}

	static registerGoogle(email, givenName, surName, authNetworkToken) {
		var apiMethod = gapi.client.qdacity.authentication.google.register({
			authNetworkToken: authNetworkToken,
			email: email,
			surName: surName,
			givenName: givenName
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getTokenGoogle(googleToken) {
		var apiMethod = gapi.client.qdacity.authentication.google.getToken({
			authNetworkToken: googleToken,
		});
		return Promisizer.makePromise(apiMethod);
	}

	static registerFacebook(email, givenName, surName, authNetworkToken) {
		var apiMethod = gapi.client.qdacity.authentication.facebook.register({
			authNetworkToken: authNetworkToken,
			email: email,
			surName: surName,
			givenName: givenName
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getTokenFacebook(facebookToken) {
		var apiMethod = gapi.client.qdacity.authentication.facebook.getToken({
			authNetworkToken: facebookToken,
		});
		return Promisizer.makePromise(apiMethod);
	}

	static registerTwitter(email, givenName, surName, authNetworkToken) {
		var apiMethod = gapi.client.qdacity.authentication.twitter.register({
			authNetworkToken: authNetworkToken,
			email: email,
			surName: surName,
			givenName: givenName
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getTokenTwitter(facebookToken) {
		var apiMethod = gapi.client.qdacity.authentication.twitter.getToken({
			authNetworkToken: facebookToken,
		});
		return Promisizer.makePromise(apiMethod);
	}

	static registerEmailPwd(email, password, givenName, surName) {
		var apiMethod = gapi.client.qdacity.authentication.email.register({
			givenName: givenName,
			surName: surName,
			email: email,
			pwd: password
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getTokenEmailPwd(email, password) {
		var apiMethod = gapi.client.qdacity.authentication.email.getToken({
			email: email,
			pwd: password
		});
		return Promisizer.makePromise(apiMethod);
	}
}
