package com.qdacity.test.CourseEndpoint;

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
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;

public class CourseEndpointTest {

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
	 * Tests if a registered user can create a course
	 */
	@Test
	public void testCourseInsert() {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		try {
			CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for course creation");
		}

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
	}
	

}