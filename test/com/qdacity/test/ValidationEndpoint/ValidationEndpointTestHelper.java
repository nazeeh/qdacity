package com.qdacity.test.ValidationEndpoint;

import static org.junit.Assert.fail;

import java.util.List;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.users.User;
import com.qdacity.endpoint.ProjectEndpoint;
import com.qdacity.project.ProjectRevision;
import com.qdacity.project.ValidationProject;
import com.qdacity.test.ProjectEndpoint.ProjectEndpointTestHelper;
import com.qdacity.test.TextDocumentEndpointTest.TextDocumentEndpointTestHelper;


public class ValidationEndpointTestHelper {
	public static String originalText = "<p><coding id=\"1\" code_id=\"1\">First paragraph</coding></p><p><coding id=\"2\" code_id=\"1\">Second paragraph</coding></p><p>Third paragraph</p><p>Fourth paragraph</p><p>Fifth paragraph</p><p>Sixth paragraph</p><p>Seventh paragraph</p><p>Eighth paragraph</p>";
	public static String recodedText = "<p><coding id=\"1\" code_id=\"1\">First paragraph</coding></p><p>Second paragraph</p><p>Third paragraph</p><p>Fourth paragraph</p><p>Fifth paragraph</p><p>Sixth paragraph</p><p>Seventh paragraph</p><p>Eighth paragraph</p>";

	static public ValidationProject setUpValidationProject(User testUser, User validationCode) {
		ProjectEndpointTestHelper.setupProjectWithCodesystem(1L, "My Project", "I'm testing this to evaluate a revision", testUser);
		TextDocumentEndpointTestHelper.addTextDocument(1L, ValidationEndpointTestHelper.originalText, "Test Document", testUser);

		ProjectEndpoint pe = new ProjectEndpoint();
		try {
			ProjectRevision revision = pe.createSnapshot(1L, "A test revision", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User failed to be authorized for creating a snapshot");
		}

		List<ProjectRevision> revisions;
		try {
			revisions = pe.listRevisions(1L, testUser);
			Long revID = revisions.get(0).getId();
			pe.requestValidationAccess(revID, validationCode);

			ValidationProject valprj = pe.createValidationProject(revID, validationCode.getUserId(), testUser);
			return valprj;
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("Failed authorization for creating a validationproject");
		}
		return null;
	}
}
