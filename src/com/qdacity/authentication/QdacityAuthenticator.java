package com.qdacity.authentication;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.Collections;
import java.util.logging.Level;

import javax.servlet.http.HttpServletRequest;

import com.google.api.client.extensions.appengine.http.UrlFetchTransport;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.config.Authenticator;
import com.qdacity.Constants;

/**
 * Custom authentication class that interacts with google cloud api and injects automatically a User object.
 * The user object is null if the authentication failed.
 * 
 * Usage in Endpoint:
 * @Api(
 * 	...
 *	authenticators = {QdacityAuthenticator.class}
 * )
 */
public class QdacityAuthenticator implements Authenticator {
	
	TokenValidator googleIdTokenValidator = new GoogleIdTokenValidator();
	
    /**
     * Validates the received token and returns a User object if the token was valid.
     * Dependent on the "AuthAuthority" header the matching TokenValidator is chosen.
     * @return the authenticated user or null if authentication failed.
     */
    @Override
    public User authenticate(HttpServletRequest httpServletRequest) {
        //get token
        final String authorizationHeader = httpServletRequest.getHeader("Authorization");
        
        //verify
        if(authorizationHeader != null) {
        	String idTokenString = authorizationHeader.replace("Bearer ", "");
        	
    		return googleIdTokenValidator.validate(idTokenString);
        }

        return null;
    }
}