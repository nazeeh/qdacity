package com.qdacity.authentication;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import com.google.api.server.spi.config.Authenticator;
import com.google.appengine.api.utils.SystemProperty;

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

	public static final String PROVIDER_EMAILPWD = "emailpwd";
	public static final String PROVIDER_GOOGLE = "google";
	public static final String PROVIDER_GOOGLE_ACCESS_TOKEN = "googleaccesstoken";

	TokenValidator googleIdTokenValidator = new GoogleIdTokenValidator();
	TokenValidator googleAccessTokenValidator = new GoogleAccessTokenValidator();
	TokenValidator emailpwdTokenValidator = new EmailPasswordValidator();
	TokenValidator testTokenValidator = new TestTokenValidator();
	
    /**
     * Validates the received token and returns a User object if the token was valid.
     * The token should have the format "Bearer <token> <provider>".
     * Dependent on the <provider> the matching TokenValidator is chosen.
     * @return the authenticated user or null if authentication failed.
     */
    @Override
    public AuthenticatedUser authenticate(HttpServletRequest httpServletRequest) {
        //get token
        final String authorizationHeader = httpServletRequest.getHeader("Authorization");

        //verify
        if(authorizationHeader != null) {
        	String tokenInfo = authorizationHeader.replace("Bearer ", "");
        	String[] tokenParts = tokenInfo.split(" ");
        	
        	if(tokenParts.length < 1) {
        		// no token sent
        		return null;
        	}
        	String idTokenString = tokenParts[0];
        	
    		// no provider information was sent. Use default case!
        	String provider = "GoogleAccessToken";
        	if(tokenParts.length >= 2) {
        		provider = tokenParts[1];
        	}


			// Is the server running as a development server? Then authorize all.
			// But make Email+Password work as well!
			if (SystemProperty.environment.value() == SystemProperty.Environment.Value.Development
					&& !provider.equals(PROVIDER_EMAILPWD)) {
				return testTokenValidator.validate("");
			}


			switch (provider.toLowerCase()) {			
				case PROVIDER_GOOGLE:
		    		return googleIdTokenValidator.validate(idTokenString);
				case PROVIDER_EMAILPWD:
					return emailpwdTokenValidator.validate(idTokenString);
				case PROVIDER_GOOGLE_ACCESS_TOKEN:
				default:
					return googleAccessTokenValidator.validate(idTokenString);
			}
        }

        return null;
    }
}