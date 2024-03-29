package com.qdacity.test.TextDocumentEndpointTest;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.Collection;

import javax.jdo.PersistenceManager;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;

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
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.endpoint.datastructures.TextDocumentCodeContainer;
import com.qdacity.endpoint.datastructures.TextDocumentList;
import com.qdacity.project.ProjectType;
import com.qdacity.project.codesystem.Code;
import com.qdacity.project.data.TextDocument;
import com.qdacity.test.CodeEndpoint.CodeEndpointTestHelper;
import com.qdacity.test.ProjectEndpoint.ProjectEndpointTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;
import com.qdacity.user.LoginProviderType;

public class TextDocumentEndpointTest {

	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(true));
	private final com.google.api.server.spi.auth.common.User testUser = new AuthenticatedUser("123456", "asd@asd.de", LoginProviderType.GOOGLE);
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
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testTextDocumentInsert() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		try {
			ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}

		TextDocumentEndpointTestHelper.addTextDocument(1L, "First document text", "First Title", testUser);
		TextDocumentEndpointTestHelper.addTextDocument(1L, "Second document text", "Second Title", testUser);
		Collection<TextDocument> documents = TextDocumentEndpointTestHelper.getTextDocuments(1L, ProjectType.PROJECT, testUser);
		
		assertEquals(2, documents.size());
	}
	
	/**
	 * Tests if a registered user can remove a text document for a project
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testTextDocumentRemove() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		try {
			ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}

		TextDocumentEndpointTestHelper.addTextDocument(1L, "First document text", "First Title", testUser);

		Collection<TextDocument> documents = TextDocumentEndpointTestHelper.getTextDocuments(1L, ProjectType.PROJECT, testUser);
		assertEquals(1, documents.size());
		TextDocument doc = (TextDocument) documents.toArray()[0];

		TextDocumentEndpointTestHelper.removeTextDocument(doc.getId(), testUser);

		documents = TextDocumentEndpointTestHelper.getTextDocuments(1L, ProjectType.PROJECT, testUser);
		assertEquals(0, documents.size());

	}

	/**
	 * Tests if a registered user can insert a text document for a project
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testTextDocumentUpdate() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		ProjectEndpointTestHelper.setupProjectWithCodesystem(1L, "My Project", "My description", testUser);

		TextDocumentEndpointTestHelper.addTextDocument(1L, "First document text", "First Title", testUser);

		Collection<TextDocument> documents = TextDocumentEndpointTestHelper.getTextDocuments(1L, ProjectType.PROJECT, testUser);
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

		documents = TextDocumentEndpointTestHelper.getTextDocuments(1L, ProjectType.PROJECT, testUser);
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
			documents = TextDocumentEndpointTestHelper.getTextDocuments(1L, ProjectType.PROJECT, testUser);
			doc = (TextDocument) documents.toArray()[0];
			assertEquals("Yet another text", doc.getText().getValue());
		} catch (UnauthorizedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	/**
	 * Tests if a registered user can insert a text document for a project
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testTextDocumentUpdateMultiple() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		ProjectEndpointTestHelper.setupProjectWithCodesystem(1L, "My Project", "My description", testUser);

		TextDocumentEndpointTestHelper.addTextDocument(1L, "First document text", "First Title", testUser);
		TextDocumentEndpointTestHelper.addTextDocument(1L, "Second document text", "Second Title", testUser);
		TextDocumentEndpointTestHelper.addTextDocument(1L, "Third document text", "Third Title", testUser);

		Collection<TextDocument> documents = TextDocumentEndpointTestHelper.getTextDocuments(1L, ProjectType.PROJECT, testUser);
		TextDocument doc1 = (TextDocument)documents.toArray()[0];
		TextDocument doc2 = (TextDocument)documents.toArray()[1];
		TextDocument doc3 = (TextDocument)documents.toArray()[2];
		
		doc1.setPositionInOrder(5L);
		
		Text text = new Text("A changed text");
		doc2.setText(text);
		
		doc3.setTitle("Title test");
		doc3.setPositionInOrder(4L);
		
		TextDocumentEndpoint tde = new TextDocumentEndpoint();

		TextDocumentList list = new TextDocumentList();
		list.setDocuments(java.util.Arrays.<TextDocument>asList(documents.<TextDocument>toArray(new TextDocument[3])));
		
		try {
			tde.updateTextDocuments(list, testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for updating multiple text documents");
		}

		documents = TextDocumentEndpointTestHelper.getTextDocuments(1L, ProjectType.PROJECT, testUser);
		doc1 = (TextDocument)documents.toArray()[0];
		doc2 = (TextDocument)documents.toArray()[1];
		doc3 = (TextDocument)documents.toArray()[2];
		
		assertEquals(5L, doc1.getPositionInOrder(), 0);
		assertEquals("A changed text", doc2.getText().getValue());
		assertEquals(4L, doc3.getPositionInOrder(), 0);
		assertEquals("Title test", doc3.getTitle());
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

	/**
	 * Tests if a EntityNotFoundException thrown correctly on update
	 * 
	 * *
	 * 
	 * @throws UnauthorizedException
	 */
	@Test
	public void testDocumentUpdateNonExisting() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		ProjectEndpointTestHelper.setupProjectWithCodesystem(1L, "My Project", "My description", testUser);

		TextDocument doc = new TextDocument();
		doc.setId(55555L);
		doc.setProjectID(5L);
		doc.setText(new Text("test"));
		doc.setTitle("Some title");
		
		expectedException.expect(EntityNotFoundException.class);
		expectedException.expectMessage(is("Object does not exist"));
		TextDocumentEndpointTestHelper.addTextDocument(1L, "First document text", "First Title", testUser);
		TextDocumentEndpoint tde = new TextDocumentEndpoint();
		tde.updateTextDocument(doc, testUser);
	}

	/**
	 * Tests if a EntityNotFoundException thrown correctly on applyCode
	 * 
	 * *
	 * 
	 * @throws UnauthorizedException
	 */
	@Test
	public void testDocumentApplyCodeNonExisting() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		ProjectEndpointTestHelper.setupProjectWithCodesystem(1L, "My Project", "My description", testUser);

		TextDocument doc = new TextDocument();
		doc.setId(55555L);
		doc.setProjectID(5L);
		doc.setText(new Text("test"));
		doc.setTitle("Some title");

		TextDocumentCodeContainer documentCode = new TextDocumentCodeContainer();
		documentCode.textDocument = doc;
		documentCode.code = new Code();

		expectedException.expect(EntityNotFoundException.class);
		expectedException.expectMessage(is("Object does not exist"));
		TextDocumentEndpointTestHelper.addTextDocument(1L, "First document text", "First Title", testUser);
		TextDocumentEndpoint tde = new TextDocumentEndpoint();
		tde.applyCode(documentCode, testUser);
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}