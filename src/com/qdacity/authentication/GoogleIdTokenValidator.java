package com.qdacity.authentication;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.logging.Level;

import com.google.api.client.extensions.appengine.http.UrlFetchTransport;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.server.spi.auth.common.User;
import com.qdacity.Constants;

/**
 * Validates Google ID tokens (OIDC).
 */
public class GoogleIdTokenValidator implements TokenValidator {

	private final JacksonFactory jacksonFactory = new JacksonFactory();
	private final GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(UrlFetchTransport.getDefaultInstance(), jacksonFactory)
            .setAudience(Collections.singletonList(Constants.WEB_CLIENT_ID))
            .build();
	
	/**
	 * Validate the token and return a user object.
	 * @param token the id token.
	 * @return the user object or null if authentication failed.
	 */
	@Override
	public User validate(String token) {

		GoogleIdToken idToken = null;
		try {
			idToken = verifier.verify(token);
		} catch (GeneralSecurityException | IOException e) {
			java.util.logging.Logger.getLogger("logger").log(Level.WARNING, "The given authentication token could not be verified.");
			return null;
		}
		if (idToken != null) {
			Payload payload = idToken.getPayload();
			String userId = payload.getSubject();
			String email = payload.getEmail();
		  
			return new User(userId, email);
		} else {
			java.util.logging.Logger.getLogger("logger").log(Level.WARNING, "Invalid ID token.");
			return null;
		}
	}

}
