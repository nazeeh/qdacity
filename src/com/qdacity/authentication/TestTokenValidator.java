package com.qdacity.authentication;

import com.qdacity.user.LoginProviderType;

/**
 * Validates test tokens for the test environment.
 */
public class TestTokenValidator implements TokenValidator {

	/**
	 * Validate the token and return a user object.
	 * @param token the id token.
	 * @return the user object or null if authentication failed.
	 */
	@Override
	public AuthenticatedUser validate(String token) {
		return new AuthenticatedUser("12873491331", "test@qdacity.com", LoginProviderType.GOOGLE);
	}

}
