package com.qdacity.test.UserEndpoint;

import com.qdacity.endpoint.UserEndpoint;
import com.qdacity.user.User;

public class UserEndpointTestHelper {
	static public void addUser(String email, String givenName, String surName, com.google.appengine.api.users.User loggedInUser) {
		User user = new User();
		user.setEmail(email);
		user.setGivenName(givenName);
		user.setSurName(surName);

		UserEndpoint ue = new UserEndpoint();
		ue.insertUser(user, loggedInUser);
	}
}
