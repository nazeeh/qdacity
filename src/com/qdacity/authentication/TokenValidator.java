package com.qdacity.authentication;

import com.google.api.server.spi.auth.common.User;

/**
 * A TokenValidator validates an authentication token and returns a User object.
 */
public interface TokenValidator {

	/**
	 * Validates the given token.
	 * @param token
	 * @return the User or null if authentication failed.
	 */
	User validate(String token);
}
