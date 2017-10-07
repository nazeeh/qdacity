package com.qdacity.test.AdminEndpoint;

import static org.junit.Assert.assertEquals;

import javax.jdo.PersistenceManager;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.qdacity.PMF;
import com.qdacity.admin.AdminStats;
import com.qdacity.endpoint.AdminEndpoint;
import com.qdacity.test.ProjectEndpoint.ProjectEndpointTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;
import com.qdacity.user.User;
import com.qdacity.user.UserType;


public class AdminEndpointTest {

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
	
	@Rule
	public ExpectedException expectedException = ExpectedException.none();

	@Test
	public void testUserInsert() throws UnauthorizedException {
		com.google.appengine.api.users.User loggedInUserA = new com.google.appengine.api.users.User("asd@asd.de", "bla", "1");
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserA);
		UserEndpointTestHelper.addUser("2@asd.de", "User 2", "lastName", testUser);

		PersistenceManager mgr = getPersistenceManager();
		try {
			User user = mgr.getObjectById(User.class, testUser.getUserId());
			user.setType(UserType.ADMIN);
			mgr.makePersistent(user);
		} finally {
			mgr.close();
		}

		ProjectEndpointTestHelper.setupProjectWithCodesystem(1L, "My Project", "A DescriptioN", testUser);

		AdminEndpoint ae = new AdminEndpoint();
		AdminStats adminStats = ae.getAdminStats(testUser);

		assertEquals(1, adminStats.getProjects(), 0);
		assertEquals(2, adminStats.getRegisteredUsers(), 0);
		assertEquals(2, adminStats.getActiveUsers(), 0);


	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}