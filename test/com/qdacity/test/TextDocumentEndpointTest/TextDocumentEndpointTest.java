package com.qdacity.test.TextDocumentEndpointTest;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.Collection;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.project.data.TextDocument;
import com.qdacity.test.ProjectEndpoint.ProjectEndpointTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;

public class TextDocumentEndpointTest {

	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(true));
	private final com.google.appengine.api.users.User testUser = new com.google.appengine.api.users.User("asd@asd.de", "bla", "123456");
	@Before
	public void setUp() {
		helper.setUp();
	}

	@After
	public void tearDown() {
		helper.tearDown();
	}

	/**
	 * Tests if a registered user can insert a text document for a project
	 */
	@Test
	public void testTextDocumentInsert() {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		try {
			ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}

		TextDocumentEndpointTestHelper.addTextDocument(1L, "First document text", "First Title", testUser);
		TextDocumentEndpointTestHelper.addTextDocument(1L, "Second document text", "Second Title", testUser);
		Collection<TextDocument> documents = TextDocumentEndpointTestHelper.getTextDocuments(1L, "PROJECT", testUser);
		
		assertEquals(2, documents.size());
	}
	
	/**
	 * Tests if a registered user can insert a text document for a project
	 */
	@Test
	public void testTextDocumentUpdate() {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		ProjectEndpointTestHelper.setupProjectWithCodesystem(1L, "My Project", "My description", testUser);

		TextDocumentEndpointTestHelper.addTextDocument(1L, "First document text", "First Title", testUser);

		Collection<TextDocument> documents = TextDocumentEndpointTestHelper.getTextDocuments(1L, "PROJECT", testUser);
		TextDocument doc = (TextDocument)documents.toArray()[0];
		Text text = new Text("A changed text");
		doc.setText(text);
		
		TextDocumentEndpoint tde = new TextDocumentEndpoint();

		try {
			tde.updateTextDocument(doc, testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for updating a text document");
		}

		documents = TextDocumentEndpointTestHelper.getTextDocuments(1L, "PROJECT", testUser);
		doc = (TextDocument) documents.toArray()[0];
		assertEquals("A changed text", doc.getText().getValue());

	}
}