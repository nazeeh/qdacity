package com.qdacity.test.UserEndpoint;

import static org.junit.Assert.fail;

import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.endpoint.UserEndpoint;
import com.qdacity.user.User;

public class UserEndpointTestHelper {
	static public void addUser(String email, String givenName, String surName, com.google.api.server.spi.auth.common.User loggedInUser) throws UnauthorizedException {
		User user = new User();
		user.setEmail(email);
		user.setGivenName(givenName);
		user.setSurName(surName);

		UserEndpoint ue = new UserEndpoint();
		ue.insertUser(user, loggedInUser);
	}

	static public User getUser(com.google.api.server.spi.auth.common.User loggedInUser) {
		UserEndpoint ue = new UserEndpoint();
		User user = null;
		try {
			user = ue.getCurrentUser(loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not retrieve his user obj");
		}
		return user;
	}
}
