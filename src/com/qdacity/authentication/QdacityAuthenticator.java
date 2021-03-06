package com.qdacity.authentication;

import javax.servlet.http.HttpServletRequest;

import com.google.api.server.spi.config.Authenticator;

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

	public static final String PROVIDER_CUSTOM_JWT = "qdacity-custom";
	public static final String PROVIDER_GOOGLE = "google";
	public static final String PROVIDER_GOOGLE_ACCESS_TOKEN = "googleaccesstoken";

	TokenValidator googleIdTokenValidator = new GoogleIdTokenValidator();
	TokenValidator googleAccessTokenValidator = new GoogleAccessTokenValidator();
	TokenValidator customTokenValidator = new CustomJWTValidator();
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
        	String provider = PROVIDER_GOOGLE_ACCESS_TOKEN;
        	if(tokenParts.length >= 2) {
        		provider = tokenParts[1];
        	}

			switch (provider.toLowerCase()) {
				case PROVIDER_CUSTOM_JWT:
					return customTokenValidator.validate(idTokenString);
				case PROVIDER_GOOGLE_ACCESS_TOKEN:
				default:
					return googleAccessTokenValidator.validate(idTokenString);
			}
        }

        return null;
    }
}