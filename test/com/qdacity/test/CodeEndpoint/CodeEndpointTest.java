package com.qdacity.test.CodeEndpoint;

import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.test.CodeSystemEndpoint.CodeSystemTestHelper;
import com.qdacity.test.ProjectEndpoint.ProjectEndpointTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;

public class CodeEndpointTest {
	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(true));

	private final com.google.appengine.api.users.User testUser = new com.google.appengine.api.users.User("asd@asd.de", "bla", "123456");

	@Before
	public void setUp() {
		helper.setUp();
		// queueHelper.setUp();
	}

	@After
	public void tearDown() {
		// queueHelper.tearDown();
		helper.tearDown();
	}

	/**
	 * Tests if a registered user can create a new code for a code system
	 */
	@Test
	public void testCodeInsert() {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		CodeSystemTestHelper.addCodeSystem(1L, testUser);
		assertEquals(1, ds.prepare(new Query("Code")).countEntities(withLimit(10)));
		try {
			ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, testUser);
		} catch (UnauthorizedException e) {
			fail("User could not be authorized for code creation");
			e.printStackTrace();
		}

		CodeEndpointTestHelper.addCode(1L, 1L, 1L, "authorName", testUser);

		assertEquals(2, ds.prepare(new Query("Code")).countEntities(withLimit(10))); // it is two because of the codesystem
	}

	/**
	 * Tests if a registered user can create a new code for a code system
	 */
	@Test
	public void testCodeRemove() {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		testCodeInsert();
		assertEquals(2, ds.prepare(new Query("Code")).countEntities(withLimit(10)));

		CodeEndpointTestHelper.removeCode(1L, testUser);

		assertEquals(1, ds.prepare(new Query("Code")).countEntities(withLimit(10)));

	}
}
