package com.qdacity.test.UserEndpoint;
import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.jdo.PersistenceManager;

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
import com.qdacity.Cache;
import com.qdacity.PMF;
import com.qdacity.endpoint.UserEndpoint;
import com.qdacity.user.User;
import com.qdacity.user.UserType;

public class UserEndpointTest {

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
	public void testUserInsert() {
		com.google.appengine.api.users.User loggedInUserA = new com.google.appengine.api.users.User("asd@asd.de", "bla", "1");
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserA);
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("User")).countEntities(withLimit(10)));
	}
	
	@Test
	public void testGetUser() {
		User user = new User();
		com.google.appengine.api.users.User loggedInUserA = new com.google.appengine.api.users.User("asd@asd.de", "bla", "1");

		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserA);
		UserEndpoint ue = new UserEndpoint();
		try {
			user = ue.getUser("1", loggedInUserA);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}
		assertEquals("firstName", user.getGivenName());

		PersistenceManager mgr = getPersistenceManager();
		Date time = new Date();
		time.setTime(0);
		user.setLastLogin(null);
		mgr.makePersistent(user);
		Cache.cache(user.getId(), User.class, user);
		mgr.close();
		try {
			user = ue.getUser("1", loggedInUserA);

		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}

	}
	
	@Test
	public void testUserDelete() {		
		com.google.appengine.api.users.User loggedInUserA = new com.google.appengine.api.users.User("asd@asd.de", "bla", "1");
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserA);

		UserEndpoint ue = new UserEndpoint();
		try {
			ue.removeUser("1", loggedInUserA);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(0, ds.prepare(new Query("User")).countEntities(withLimit(10)));
	}
	
	@Test
	public void testUserDeleteAuthorization() {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(0, ds.prepare(new Query("User")).countEntities(withLimit(10)));

		com.google.appengine.api.users.User loggedInUserA = new com.google.appengine.api.users.User("asd@asd.de", "bla", "1");
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserA);
		assertEquals(1, ds.prepare(new Query("User")).countEntities(withLimit(10)));

		com.google.appengine.api.users.User loggedInUserB = new com.google.appengine.api.users.User("asd@asd.de", "bla", "2");
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserB);
		assertEquals(2, ds.prepare(new Query("User")).countEntities(withLimit(10)));

		UserEndpoint ue = new UserEndpoint();
		try {
			ue.removeUser("1", loggedInUserB); // User B should not be able to delete User B
		} catch (UnauthorizedException e) {
			// should be executed
			e.printStackTrace();
		}

		assertEquals(2, ds.prepare(new Query("User")).countEntities(withLimit(10)));
	}

	@Test
	public void testUserDeleteAuthorizationUnregistered() throws UnauthorizedException {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(0, ds.prepare(new Query("User")).countEntities(withLimit(10)));

		com.google.appengine.api.users.User loggedInUserA = new com.google.appengine.api.users.User("asd@asd.de", "bla", "1");
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserA);
		assertEquals(1, ds.prepare(new Query("User")).countEntities(withLimit(10)));

		com.google.appengine.api.users.User loggedInUserB = new com.google.appengine.api.users.User("asd@asd.de", "bla", "2");

		UserEndpoint ue = new UserEndpoint();
		expectedException.expect(UnauthorizedException.class);
		expectedException.expectMessage(is("User 2 is Not Authorized"));

		ue.removeUser("1", loggedInUserB); // User B should not be able to delete User B


		assertEquals(2, ds.prepare(new Query("User")).countEntities(withLimit(10)));
	}

	@Test
	public void testFindUser() {
		List<User> test = new ArrayList<User>();
		com.google.appengine.api.users.User loggedInUserA = new com.google.appengine.api.users.User("asd@asd.de", "bla", "1");
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserA);

		UserEndpoint ue = new UserEndpoint();
		try {
			test = ue.findUsers(null, null, "asd@asd.de", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}
		assertEquals(1, test.size());
	}

	@Test
	public void testUpdateUserType() {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();

		com.google.appengine.api.users.User loggedInUserA = new com.google.appengine.api.users.User("asd@asd.de", "bla", "1");
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserA);

		PersistenceManager mgr = getPersistenceManager();
		mgr.setIgnoreCache(true);
		try {
			User user = mgr.getObjectById(User.class, "1");
			assertEquals(UserType.USER, user.getType());

			UserEndpoint ue = new UserEndpoint();
			try {
				user = ue.updateUserType("1", "ADMIN", loggedInUserA);
			} catch (UnauthorizedException e) {
				e.printStackTrace();
				fail("User could not be authorized");
			}
			User user2 = mgr.getObjectById(User.class, "1");
			assertEquals(UserType.ADMIN, user.getType());
		} finally {
			mgr.close();
		}
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}