package com.qdacity.test.CodeEndpoint;

import static org.junit.Assert.fail;

import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.endpoint.CodeEndpoint;
import com.qdacity.project.codesystem.Code;

public class CodeEndpointTestHelper {
	static public void addCode(Long id, Long codeID, Long codesystemID, String authorName, com.google.appengine.api.users.User loggedInUser) {
		try {
			Code code = new Code();
			code.setAuthor(authorName);
			code.setCodeID(codeID);
			code.setCodesystemID(codesystemID);
			CodeEndpoint ce = new CodeEndpoint();
			ce.insertCode(null, null, code, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for code creation");
		}
	}
}
