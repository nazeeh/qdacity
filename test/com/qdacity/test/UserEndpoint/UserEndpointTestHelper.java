package com.qdacity.test.UserEndpoint;

import com.qdacity.endpoint.UserEndpoint;
import com.qdacity.user.User;

public class UserEndpointTestHelper {
	static public void addUser(String id, String email){
		User user = new User();
		user.setEmail(email);
		user.setId(id);
		com.google.appengine.api.users.User loggedInUser = new com.google.appengine.api.users.User("asd@asd.de", "bla", "123456");

		UserEndpoint ue = new UserEndpoint();
		ue.insertUser(user, loggedInUser);
	}
}
