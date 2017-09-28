package com.qdacity.test.ProjectEndpoint;

import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.qdacity.endpoint.ProjectEndpoint;
import com.qdacity.test.CodeSystemEndpoint.CodeSystemTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;

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

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("Project")).countEntities(withLimit(10)));
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
		assertEquals(1, ds.prepare(new Query("ProjectRevision")).countEntities(withLimit(10)));

	}
}