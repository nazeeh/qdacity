package com.qdacity.authentication;

/**
 * A TokenValidator validates an authentication token and returns a User object.
 */
public interface TokenValidator {

	/**
	 * Validates the given token.
	 * @param token
	 * @return the User or null if authentication failed.
	 */
	AuthenticatedUser validate(String token);
}
