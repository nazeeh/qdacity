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
			authNetworkToken: googleToken
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
			authNetworkToken: facebookToken
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
			authNetworkToken: facebookToken
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

	static confirmEmail(confirmationCode) {
		var apiMethod = gapi.client.qdacity.authentication.email.confirmRegistration({
			confirmationCode: confirmationCode
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

	static changePassword(oldPassword, newPassword) {
		var apiMethod = gapi.client.qdacity.auth.changePassword({
			oldPassword: oldPassword,
			newPassword: newPassword
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getAssociatedLogins() {
		var apiMethod = gapi.client.qdacity.auth.getAssociatedLogins();
		return Promisizer.makePromise(apiMethod);
	}

	static associateGoogleLogin(googleIdToken) {
		var apiMethod = gapi.client.qdacity.auth.associateGoogleLogin({
			googleIdToken: googleIdToken
		});
		return Promisizer.makePromise(apiMethod);
	}

	static associateFacebookLogin(facebookAccessToken) {
		var apiMethod = gapi.client.qdacity.auth.associateFacebookLogin({
			authNetworkToken: facebookAccessToken
		});
		return Promisizer.makePromise(apiMethod);
	}

	static associateTwitterLogin(twitterAccessToken) {
		var apiMethod = gapi.client.qdacity.auth.associateTwitterLogin({
			authNetworkToken: twitterAccessToken
		});
		return Promisizer.makePromise(apiMethod);
	}

	static associateEmailPassword(email, password) {
		var apiMethod = gapi.client.qdacity.auth.associateEmailPassword({
			email: email,
			password: password
		});
		return Promisizer.makePromise(apiMethod);
	}

	static disassociateLogin(associatedLogin) {
		var apiMethod = gapi.client.qdacity.auth.disassociateLogin(associatedLogin);
		return Promisizer.makePromise(apiMethod);
	}
}
