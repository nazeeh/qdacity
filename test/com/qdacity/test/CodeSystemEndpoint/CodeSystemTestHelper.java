package com.qdacity.test.CodeSystemEndpoint;

import static org.junit.Assert.fail;

import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.endpoint.CodeSystemEndpoint;
import com.qdacity.project.codesystem.CodeSystem;

public class CodeSystemTestHelper {
	static public void addCodeSystem(Long id, com.google.appengine.api.users.User loggedInUser) {
		try {
			CodeSystem cs = new CodeSystem();
			cs.setId(id);
			CodeSystemEndpoint cse = new CodeSystemEndpoint();
			cse.insertCodeSystem(cs, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for code system creation");
		}
	}
}
