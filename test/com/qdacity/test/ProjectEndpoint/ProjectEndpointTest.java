package com.qdacity.test.ProjectEndpoint;

import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.Collection;
import java.util.List;
import java.util.concurrent.TimeUnit;

import javax.jdo.PersistenceManager;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.PMF;
import com.qdacity.endpoint.ProjectEndpoint;
import com.qdacity.endpoint.UserNotificationEndpoint;
import com.qdacity.project.Project;
import com.qdacity.project.ProjectRevision;
import com.qdacity.project.ProjectType;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.TextDocument;
import com.qdacity.test.CodeSystemEndpoint.CodeSystemTestHelper;
import com.qdacity.test.TextDocumentEndpointTest.TextDocumentEndpointTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;
import com.qdacity.user.User;
import com.qdacity.user.UserNotification;

public class ProjectEndpointTest {

	private final LocalTaskQueueTestConfig.TaskCountDownLatch latch = new LocalTaskQueueTestConfig.TaskCountDownLatch(1);
	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(false).setCallbackClass(LocalTaskQueueTestConfig.DeferredTaskCallback.class).setTaskExecutionLatch(latch));
	private final com.google.api.server.spi.auth.common.User testUser = new com.google.api.server.spi.auth.common.User("123456", "asd@asd.de");
	@Before
	public void setUp() {
		helper.setUp();
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		Iterable<Entity> users = ds.prepare(new Query("User")).asIterable();
		for (Entity entity : users) {
			ds.delete(entity.getKey());
		}
		
	}

	@After
	public void tearDown() {
		helper.tearDown();
		latch.reset(1);
	}

	/**
	 * Tests if a registered user can create a project
	 */
	@Test
	public void testProjectInsert() {
		latch.reset(3);
		com.google.api.server.spi.auth.common.User loggedInUser = new com.google.api.server.spi.auth.common.User("123456", "asd@asd.de");
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUser);
		try {
			ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for project creation");
		}

		ProjectEndpoint pe = new ProjectEndpoint();
		try {
			CollectionResponse<Project> projects = pe.listProject(null, null, loggedInUser);
			assertEquals(1, projects.getItems().size());
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("Failed to authorize the user for listing his projects");
		}
		
		PersistenceManager mgr = getPersistenceManager();
		User user = UserEndpointTestHelper.getUser(loggedInUser);
		user.setLastProjectId(null);
		user.setLastProjectType(null);
		mgr.makePersistent(user);
		

		try {
			pe.getProject(1L, "PROJECT", loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User was not authorized to retrieve project");
		}

		try {
			latch.await(10, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
			fail("Deferred task did not finish in time");
		}
		MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
		syncCache.clearAll(); // FIXME LastProjectUsed.java should update the cache with new user object

		user = UserEndpointTestHelper.getUser(loggedInUser);
		assertEquals(1L, user.getLastProjectId(), 0);
		assertEquals(ProjectType.PROJECT, user.getLastProjectType());
	}

	@Rule
	public ExpectedException expectedException = ExpectedException.none();
	

	/**
	 * Tests if a non-registered user can not create a project
	 * 
	 * *
	 * 
	 * @throws UnauthorizedException
	 */
	@Test
	public void testProjectInsertAuthorization() throws UnauthorizedException {
		com.google.api.server.spi.auth.common.User loggedInUser = new com.google.api.server.spi.auth.common.User("123456", "asd@asd.de");
		
		expectedException.expect(UnauthorizedException.class);
		expectedException.expectMessage(is("User is not registered"));
		ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, loggedInUser);

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(0, ds.prepare(new Query("Project")).countEntities(withLimit(10)));
	}

	/**
	 * Tests if a registered user can create a project
	 */
	@Test
	public void testProjectUpdate() {
		com.google.api.server.spi.auth.common.User loggedInUser = new com.google.api.server.spi.auth.common.User("123456", "asd@asd.de");
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUser);

		try {
			ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for project creation");
		}
		CodeSystemTestHelper.addCodeSystem(1L, loggedInUser);

		ProjectEndpoint pe = new ProjectEndpoint();
		Project prj = null;
		prj = ProjectEndpointTestHelper.getProject(1L, loggedInUser);
		prj.setCodesystemID(2L);
		try {
			pe.updateProject(prj, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for updating his project");
		}

		prj = ProjectEndpointTestHelper.getProject(1L, loggedInUser);
		assertEquals(2L, prj.getCodesystemID(), 0);

		try {
			pe.getAndIncrCodingId(1L, "PROJECT", loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for retrieving his project");
		}

		prj = ProjectEndpointTestHelper.getProject(1L, loggedInUser);
		assertEquals(1L, prj.getMaxCodingID(), 0);

		try {
			pe.setDescription(1L, "PROJECT", "A changed description", loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for setting the project description");
		}

		prj = ProjectEndpointTestHelper.getProject(1L, loggedInUser);
		assertEquals("A changed description", prj.getDescription());

		assertEquals(false, prj.isUmlEditorEnabled());
		try {
			pe.setUmlEditorEnabled(1L, "PROJECT", true, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for setting the UML editor flag");
		}

		prj = ProjectEndpointTestHelper.getProject(1L, loggedInUser);
		assertEquals(true, prj.isUmlEditorEnabled());

	}

	/**
	 * Tests if a user can delete his own project
	 */
	@Test
	public void testProjectRemove() {
		com.google.api.server.spi.auth.common.User loggedInUser = new com.google.api.server.spi.auth.common.User("123456", "asd@asd.de");
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUser);

		try {
			ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for project creation");
		}
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("Project")).countEntities(withLimit(10)));

		try {
			ProjectEndpointTestHelper.removeProject(1L, loggedInUser);
		} catch (UnauthorizedException e) {
			fail("User could not be authorized for project removal");
			e.printStackTrace();
		}

		assertEquals(0, ds.prepare(new Query("Project")).countEntities(withLimit(10)));
	}

	/**
	 * Tests if a a deleted project also deletes the associated code system
	 */
	@Test
	public void testProjectRemoveWithCodesystem() {
		com.google.api.server.spi.auth.common.User loggedInUser = new com.google.api.server.spi.auth.common.User("123456", "asd@asd.de");
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUser);

		CodeSystemTestHelper.addCodeSystem(1L, loggedInUser);
		try {
			ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for project creation");
		}
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("Project")).countEntities(withLimit(10)));
		assertEquals(1, ds.prepare(new Query("CodeSystem")).countEntities(withLimit(10)));

		try {
			ProjectEndpointTestHelper.removeProject(1L, loggedInUser);
		} catch (UnauthorizedException e) {
			fail("User could not be authorized for project removal");
			e.printStackTrace();
		}

		assertEquals(0, ds.prepare(new Query("Project")).countEntities(withLimit(10)));
		assertEquals(0, ds.prepare(new Query("CodeSystem")).countEntities(withLimit(10)));
	}

	/**
	 * Tests if Projects from other users can be not be deleted
	 * 
	 * @throws UnauthorizedException
	 */
	@Test
	public void testProjectRemoveAuthorization() throws UnauthorizedException {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(0, ds.prepare(new Query("User")).countEntities(withLimit(10)));
		com.google.api.server.spi.auth.common.User loggedInUserA = new com.google.api.server.spi.auth.common.User("1", "asd@asd.de");
		UserEndpointTestHelper.addUser("asd@asd.de", "User", "A", loggedInUserA);
		assertEquals(1, ds.prepare(new Query("User")).countEntities(withLimit(10)));
		com.google.api.server.spi.auth.common.User loggedInUserB = new com.google.api.server.spi.auth.common.User("2", "asd@asd.de");
		UserEndpointTestHelper.addUser("asd@asd.de", "User", "B", loggedInUserB);
		assertEquals(2, ds.prepare(new Query("User")).countEntities(withLimit(10)));

		try {
			ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, loggedInUserA);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for project creation");
		}

		assertEquals(1, ds.prepare(new Query("Project")).countEntities(withLimit(10)));

		expectedException.expect(UnauthorizedException.class);
		expectedException.expectMessage(is("User is Not Authorized"));

		ProjectEndpointTestHelper.removeProject(1L, loggedInUserB); // User B should not be able to delete project from user A

		// The project added by User A should still exist
		assertEquals(1, ds.prepare(new Query("Project")).countEntities(withLimit(10)));
	}

	/**
	 * Tests if the owner of a project can invite another user
	 * 
	 * @throws UnauthorizedException
	 */
	@Test
	public void testProjectInvitation() throws UnauthorizedException {
		ProjectEndpoint pe = new ProjectEndpoint();

		UserEndpointTestHelper.addUser("asd@asd.de", "User", "A", testUser);

		CodeSystemTestHelper.addCodeSystem(1L, testUser);

		try {
			ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for project creation");
		}

		com.google.api.server.spi.auth.common.User invitedUser = new com.google.api.server.spi.auth.common.User("7789456", "asd@asd.de");
		UserEndpointTestHelper.addUser("surname@mydomain.com", "FirstName", "SurName", invitedUser);

		UserNotificationEndpoint une = new UserNotificationEndpoint();
		List<UserNotification> notifications = une.listUserNotification(null, null, invitedUser);
		assertEquals(0, notifications.size());

		pe.inviteUser(1L, "surname@mydomain.com", testUser);


		notifications = une.listUserNotification(null, null, invitedUser);
		assertEquals(1, notifications.size());

		pe.addOwner(1L, invitedUser.getId(), invitedUser);
		notifications.get(0).setSettled(true);
		une.updateUserNotification(notifications.get(0));

		Project project = (Project) pe.getProject(1L, "PROJECT", invitedUser);

		assertEquals(2, project.getOwners().size());

	}

	/**
	 * Tests if the owner of a project remove a user
	 * 
	 * @throws UnauthorizedException
	 */
	@Test
	public void testProjectRemoveUser() throws UnauthorizedException {
		ProjectEndpoint pe = new ProjectEndpoint();

		UserEndpointTestHelper.addUser("asd@asd.de", "User", "A", testUser);

		CodeSystemTestHelper.addCodeSystem(1L, testUser);
		try {
			ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for project creation");
		}

		com.google.api.server.spi.auth.common.User invitedUser = new com.google.api.server.spi.auth.common.User("77777", "asd@asd.de");
		UserEndpointTestHelper.addUser("surname@mydomain.com", "FirstName", "SurName", invitedUser);

		UserNotificationEndpoint une = new UserNotificationEndpoint();

		pe.inviteUser(1L, "surname@mydomain.com", testUser);
		pe.addOwner(1L, invitedUser.getId(), invitedUser);

		Project project = (Project) pe.getProject(1L, "PROJECT", invitedUser);
		assertEquals(2, project.getOwners().size());

		pe.removeUser(1L, "PROJECT", invitedUser.getId(), testUser);

		project = (Project) pe.getProject(1L, "PROJECT", invitedUser);
		assertEquals(1, project.getOwners().size());

	}

	/**
	 * Tests if Projects from other users can be not be deleted
	 * 
	 * @throws UnauthorizedException
	 */
	@Test
	public void testProjectRevisionInsert() throws UnauthorizedException {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		ProjectEndpoint pe = new ProjectEndpoint();
		
		UserEndpointTestHelper.addUser("asd@asd.de", "User", "A", testUser);
		CodeSystemTestHelper.addCodeSystem(1L, testUser);
		assertEquals(1, ds.prepare(new Query("Code")).countEntities(withLimit(10)));
		try {
			ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for project creation");
		}
		
		// ProjectEndpointTestHelper.setupProjectWithCodesystem(1L, "My Project", "My description", testUser);

		TextDocumentEndpointTestHelper.addTextDocument(1L, "First document text", "First Title", testUser);

		assertEquals(1, ds.prepare(new Query("Project")).countEntities(withLimit(10)));
		ProjectRevision revision = pe.createSnapshot(1L, "A test revision", testUser);
		assertEquals(1, ds.prepare(new Query("ProjectRevision")).countEntities(withLimit(10)));
		Collection<TextDocument> docs = TextDocumentEndpointTestHelper.getTextDocuments(revision.getId(), "REVISION", testUser);
		assertEquals(1, docs.size());

	}
	
	/**
	 * Tests if Projects from other users can be not be deleted
	 * 
	 * @throws UnauthorizedException
	 */
	@Test
	public void testProjectRevision() throws UnauthorizedException {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		ProjectEndpoint ue = new ProjectEndpoint();
		
		UserEndpointTestHelper.addUser("asd@asd.de", "User", "A", testUser);
		CodeSystemTestHelper.addCodeSystem(1L, testUser);
		assertEquals(1, ds.prepare(new Query("Code")).countEntities(withLimit(10)));
		try {
			ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for project creation");
		}
		

		assertEquals(1, ds.prepare(new Query("Project")).countEntities(withLimit(10)));
		ue.createSnapshot(1L, "A test revision", testUser);
		List<ProjectRevision> revisions = ue.listRevisions(1L, testUser);
		assertEquals(1, revisions.size());
		ue.removeProjectRevision(revisions.get(0).getId(), testUser);
		revisions = ue.listRevisions(1L, testUser);
		assertEquals(0, revisions.size());

	}

	/**
	 * Tests if Projects from other users can be not be deleted
	 * 
	 * @throws UnauthorizedException
	 */
	@Test
	public void testValidationProjectCreation() throws UnauthorizedException {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		ProjectEndpoint pe = new ProjectEndpoint();

		UserEndpointTestHelper.addUser("asd@asd.de", "User", "A", testUser);
		CodeSystemTestHelper.addCodeSystem(1L, testUser);
		assertEquals(1, ds.prepare(new Query("Code")).countEntities(withLimit(10)));
		try {
			ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for project creation");
		}

		assertEquals(1, ds.prepare(new Query("Project")).countEntities(withLimit(10)));
		pe.createSnapshot(1L, "A test revision", testUser);

		com.google.api.server.spi.auth.common.User student = new com.google.api.server.spi.auth.common.User("77777", "student@asd.de");
		UserEndpointTestHelper.addUser("student@asd.de", "Student", "B", student);

		List<ProjectRevision> revisions = pe.listRevisions(1L, testUser);
		Long revID = revisions.get(0).getId();
		pe.requestValidationAccess(revID, student);

		pe.createValidationProject(revID, student.getId(), testUser);
		
		List<ValidationProject> valPrj = pe.listValidationProject(student);

		assertEquals(1, valPrj.size());

		ValidationProject project = (ValidationProject) pe.getProject(valPrj.get(0).getId(), "VALIDATION", student);

		assertEquals(revID, project.getRevisionID(), 0);

		pe.removeValidationProject(valPrj.get(0).getId(), testUser);

		valPrj = pe.listValidationProject(student);

		assertEquals(0, valPrj.size());
		



	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}