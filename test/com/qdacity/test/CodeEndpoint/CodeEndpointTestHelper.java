package com.qdacity.test.CodeEndpoint;

import static org.junit.Assert.fail;

import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.endpoint.CodeEndpoint;
import com.qdacity.project.codesystem.Code;

public class CodeEndpointTestHelper {
	static public void addCode(Long id, Long codeID, Long parentID, Long codesystemID, String authorName, String color, com.google.appengine.api.users.User loggedInUser) {
		try {
			Code code = new Code();
			code.setId(id);
			code.setAuthor(authorName);
			code.setCodeID(codeID);
			code.setParentID(parentID);
			code.setCodesystemID(codesystemID);
			code.setColor(color);
			CodeEndpoint ce = new CodeEndpoint();
			ce.insertCode(null, null, code, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for code creation");
		}
	}

	static public void removeCode(Long id, com.google.appengine.api.users.User loggedInUser) {
		try {
			CodeEndpoint ce = new CodeEndpoint();
			ce.removeCode(id, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for code creation");
		}
	}

	static public void updateCode(Code code, com.google.appengine.api.users.User loggedInUser) {
		try {
			CodeEndpoint ce = new CodeEndpoint();
			ce.updateCode(code, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for code creation");
		}
	}

	static public void relocateCode(Long codeID, Long newParentID, com.google.appengine.api.users.User loggedInUser) {
		try {
			CodeEndpoint ce = new CodeEndpoint();
			ce.relocateCode(codeID, newParentID, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for code creation");
		}
	}
}
