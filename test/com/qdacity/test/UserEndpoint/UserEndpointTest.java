package com.qdacity.test.UserEndpoint;
import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.ArrayList;
import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.qdacity.endpoint.UserEndpoint;
import com.qdacity.user.User;

public class UserEndpointTest {

	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());

	@Before
	public void setUp() {
		helper.setUp();
	}

	@After
	public void tearDown() {
		helper.tearDown();
	}
	
	

	@Test
	public void testUserInsert() {
		UserEndpointTestHelper.addUser("firstName","lastName", "123456", "asd@asd.de");
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("User")).countEntities(withLimit(10)));
	}
	
	@Test
	public void testUserDelete() {
		com.google.appengine.api.users.User loggedInUser = new com.google.appengine.api.users.User("asd@asd.de", "bla", "123456");
		
		UserEndpointTestHelper.addUser("firstName","lastName", "123456", "asd@asd.de");

		UserEndpoint ue = new UserEndpoint();
		try {
			ue.removeUser("123456", loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(0, ds.prepare(new Query("User")).countEntities(withLimit(10)));
	}
	
	@Test
	public void testFindUser() {
		com.google.appengine.api.users.User loggedInUser = new com.google.appengine.api.users.User("asd@asd.de", "bla", "123456");
		List<User> test = new ArrayList<User>();
		UserEndpointTestHelper.addUser("firstName","lastName", "123456", "asd@asd.de");

		UserEndpoint ue = new UserEndpoint();
		try {
			test = ue.findUsers(null, null, "asd@asd.de", loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, test.size());
	}
}