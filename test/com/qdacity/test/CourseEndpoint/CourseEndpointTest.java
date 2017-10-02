package com.qdacity.test.CourseEndpoint;

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
import com.qdacity.endpoint.CourseEndpoint;
import com.qdacity.test.ProjectEndpoint.ProjectEndpointTestHelper;
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
	
	/**
	 * Tests if a user can delete his own course
	 */
	@Test
	public void testCourseRemove() {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		try {
			CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for course creation");
		}
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("Course")).countEntities(withLimit(10)));

		try {
			CourseEndpointTestHelper.removeCourse(1L, testUser);
		} catch (UnauthorizedException e) {
			fail("User could not be authorized for Course removal");
			e.printStackTrace();
		}

		assertEquals(0, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
	}
	
	@Rule
	public ExpectedException expectedException = ExpectedException.none();
	
	/**
	 * Tests if Courses from other users can be not be deleted
	 * 
	 * @throws UnauthorizedException
	 */
	@Test
	public void testCourseRemoveAuthorization() throws UnauthorizedException {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(0, ds.prepare(new Query("User")).countEntities(withLimit(10)));
		com.google.appengine.api.users.User loggedInUserA = new com.google.appengine.api.users.User("asd@asd.de", "bla", "1");
		UserEndpointTestHelper.addUser("asd@asd.de", "User", "A", loggedInUserA);
		assertEquals(1, ds.prepare(new Query("User")).countEntities(withLimit(10)));
		com.google.appengine.api.users.User loggedInUserB = new com.google.appengine.api.users.User("asd@asd.de", "bla", "2");
		UserEndpointTestHelper.addUser("asd@asd.de", "User", "B", loggedInUserB);
		assertEquals(2, ds.prepare(new Query("User")).countEntities(withLimit(10)));

		try {
			CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", loggedInUserA);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for course creation");
		}

		assertEquals(1, ds.prepare(new Query("Course")).countEntities(withLimit(10)));

		expectedException.expect(UnauthorizedException.class);
		expectedException.expectMessage(is("User is Not Authorized"));

		CourseEndpointTestHelper.removeCourse(1L, loggedInUserB); // User B should not be able to delete course from user A

		// The course added by User A should still exist
		assertEquals(1, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
	}
	
	
	
	
}