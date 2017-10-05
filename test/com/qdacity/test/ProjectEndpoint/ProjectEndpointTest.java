package com.qdacity.test.ProjectEndpoint;

import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.qdacity.endpoint.ProjectEndpoint;
import com.qdacity.endpoint.UserNotificationEndpoint;
import com.qdacity.project.Project;
import com.qdacity.project.ProjectRevision;
import com.qdacity.project.ValidationProject;
import com.qdacity.test.CodeSystemEndpoint.CodeSystemTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;
import com.qdacity.user.UserNotification;

public class ProjectEndpointTest {

	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());
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
	 * Tests if a registered user can create a project
	 */
	@Test
	public void testProjectInsert() {
		com.google.appengine.api.users.User loggedInUser = new com.google.appengine.api.users.User("asd@asd.de", "bla", "123456");
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
		com.google.appengine.api.users.User loggedInUser = new com.google.appengine.api.users.User("asd@asd.de", "bla", "123456");
		
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
		com.google.appengine.api.users.User loggedInUser = new com.google.appengine.api.users.User("asd@asd.de", "bla", "123456");
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
		try {
			prj = (Project) pe.getProject(1L, "PROJECT", loggedInUser);
		} catch (UnauthorizedException e1) {
			e1.printStackTrace();
			fail("User could not be authorized for retrieving his project");
		}
		prj.setCodesystemID(2L);
		try {
			pe.updateProject(prj, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for updating his project");
		}

		try {
			prj = (Project) pe.getProject(1L, "PROJECT", loggedInUser);
			assertEquals(2L, prj.getCodesystemID(), 0);
		} catch (UnauthorizedException e1) {
			e1.printStackTrace();
			fail("User could not be authorized for retrieving his project");
		}

		try {
			pe.getAndIncrCodingId(1L, "PROJECT", loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for retrieving his project");
		}

		try {
			prj = (Project) pe.getProject(1L, "PROJECT", loggedInUser);
			assertEquals(1L, prj.getMaxCodingID(), 0);
		} catch (UnauthorizedException e1) {
			e1.printStackTrace();
			fail("User could not be authorized for retrieving his project");
		}

		try {
			pe.setDescription(1L, "PROJECT", "A changed description", loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for setting the project description");
		}

		try {
			prj = (Project) pe.getProject(1L, "PROJECT", loggedInUser);
			assertEquals("A changed description", prj.getDescription());
		} catch (UnauthorizedException e1) {
			e1.printStackTrace();
			fail("User could not be authorized for retrieving his project");
		}

		assertEquals(false, prj.isUmlEditorEnabled());
		try {
			pe.setUmlEditorEnabled(1L, "PROJECT", true, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for setting the UML editor flag");
		}

		try {
			prj = (Project) pe.getProject(1L, "PROJECT", loggedInUser);
			assertEquals(true, prj.isUmlEditorEnabled());
		} catch (UnauthorizedException e1) {
			e1.printStackTrace();
			fail("User could not be authorized for retrieving his project");
		}

	}

	/**
	 * Tests if a user can delete his own project
	 */
	@Test
	public void testProjectRemove() {
		com.google.appengine.api.users.User loggedInUser = new com.google.appengine.api.users.User("asd@asd.de", "bla", "123456");
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
		com.google.appengine.api.users.User loggedInUser = new com.google.appengine.api.users.User("asd@asd.de", "bla", "123456");
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
		com.google.appengine.api.users.User loggedInUserA = new com.google.appengine.api.users.User("asd@asd.de", "bla", "1");
		UserEndpointTestHelper.addUser("asd@asd.de", "User", "A", loggedInUserA);
		assertEquals(1, ds.prepare(new Query("User")).countEntities(withLimit(10)));
		com.google.appengine.api.users.User loggedInUserB = new com.google.appengine.api.users.User("asd@asd.de", "bla", "2");
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

		com.google.appengine.api.users.User invitedUser = new com.google.appengine.api.users.User("asd@asd.de", "bla", "77777");
		UserEndpointTestHelper.addUser("surname@mydomain.com", "FirstName", "SurName", invitedUser);

		UserNotificationEndpoint une = new UserNotificationEndpoint();
		List<UserNotification> notifications = une.listUserNotification(null, null, invitedUser);
		assertEquals(0, notifications.size());

		pe.inviteUser(1L, "surname@mydomain.com", testUser);


		notifications = une.listUserNotification(null, null, invitedUser);
		assertEquals(1, notifications.size());

		pe.addOwner(1L, invitedUser.getUserId(), invitedUser);
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

		com.google.appengine.api.users.User invitedUser = new com.google.appengine.api.users.User("asd@asd.de", "bla", "77777");
		UserEndpointTestHelper.addUser("surname@mydomain.com", "FirstName", "SurName", invitedUser);

		UserNotificationEndpoint une = new UserNotificationEndpoint();

		pe.inviteUser(1L, "surname@mydomain.com", testUser);
		pe.addOwner(1L, invitedUser.getUserId(), invitedUser);

		Project project = (Project) pe.getProject(1L, "PROJECT", invitedUser);
		assertEquals(2, project.getOwners().size());

		pe.removeUser(1L, "PROJECT", invitedUser.getUserId(), testUser);

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
		assertEquals(1, ds.prepare(new Query("ProjectRevision")).countEntities(withLimit(10)));

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

		com.google.appengine.api.users.User student = new com.google.appengine.api.users.User("student@asd.de", "bla", "77777");
		UserEndpointTestHelper.addUser("student@asd.de", "Student", "B", student);

		List<ProjectRevision> revisions = ue.listRevisions(1L, testUser);
		Long revID = revisions.get(0).getId();
		ue.requestValidationAccess(revID, student);

		ue.createValidationProject(revID, student.getUserId(), testUser);
		
		List<ValidationProject> valPrj = ue.listValidationProject(student);

		assertEquals(1, valPrj.size());

		ue.removeValidationProject(valPrj.get(0).getId(), testUser);

		valPrj = ue.listValidationProject(student);

		assertEquals(0, valPrj.size());

	}
}