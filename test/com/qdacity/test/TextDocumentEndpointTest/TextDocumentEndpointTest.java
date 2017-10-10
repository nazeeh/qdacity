package com.qdacity.test.TextDocumentEndpointTest;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.Collection;

import javax.jdo.PersistenceManager;
import javax.persistence.EntityExistsException;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.PMF;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.endpoint.datastructures.TextDocumentCodeContainer;
import com.qdacity.project.codesystem.Code;
import com.qdacity.project.data.TextDocument;
import com.qdacity.test.CodeEndpoint.CodeEndpointTestHelper;
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
	 * Tests if a registered user can remove a text document for a project
	 */
	@Test
	public void testTextDocumentRemove() {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		try {
			ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}

		TextDocumentEndpointTestHelper.addTextDocument(1L, "First document text", "First Title", testUser);

		Collection<TextDocument> documents = TextDocumentEndpointTestHelper.getTextDocuments(1L, "PROJECT", testUser);
		assertEquals(1, documents.size());
		TextDocument doc = (TextDocument) documents.toArray()[0];

		TextDocumentEndpointTestHelper.removeTextDocument(doc.getId(), testUser);

		documents = TextDocumentEndpointTestHelper.getTextDocuments(1L, "PROJECT", testUser);
		assertEquals(0, documents.size());

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

		TextDocumentCodeContainer textDocumentCode = new TextDocumentCodeContainer();
		doc.setText(new Text("Yet another text"));
		textDocumentCode.textDocument = doc;
		CodeEndpointTestHelper.addCode(123L, 1L, 1L, 15648758L, "Author Name", "#fff", testUser);
		Code code = CodeEndpointTestHelper.getCode(123L, testUser);
		textDocumentCode.code = code;
		try {
			tde.applyCode(textDocumentCode, testUser);
			documents = TextDocumentEndpointTestHelper.getTextDocuments(1L, "PROJECT", testUser);
			doc = (TextDocument) documents.toArray()[0];
			assertEquals("Yet another text", doc.getText().getValue());
		} catch (UnauthorizedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	@Rule
	public ExpectedException expectedException = ExpectedException.none();

	/**
	 * Tests if a EntityExistsException thrown correctly on insert
	 * 
	 * *
	 * 
	 * @throws UnauthorizedException
	 */
	@Test
	public void testDocumentInsertDuplicate() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		ProjectEndpointTestHelper.setupProjectWithCodesystem(1L, "My Project", "My description", testUser);

		TextDocument doc = TextDocumentEndpointTestHelper.addTextDocument(1L, "First document text", "First Title", testUser);

		expectedException.expect(EntityExistsException.class);
		expectedException.expectMessage(is("Object already exists"));
		TextDocumentEndpointTestHelper.addTextDocument(1L, "First document text", "First Title", testUser);
		TextDocumentEndpoint tde = new TextDocumentEndpoint();
		tde.insertTextDocument(doc, testUser);
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}