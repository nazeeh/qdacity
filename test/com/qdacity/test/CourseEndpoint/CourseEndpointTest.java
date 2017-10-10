package com.qdacity.test.CourseEndpoint;

import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.List;

import javax.jdo.PersistenceManager;
import javax.persistence.EntityExistsException;

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
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.qdacity.PMF;
import com.qdacity.course.Course;
import com.qdacity.course.TermCourse;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;
import com.qdacity.user.User;
import com.qdacity.user.UserType;

public class CourseEndpointTest {

	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());
	private final com.google.appengine.api.users.User testUser = new com.google.appengine.api.users.User("asd@asd.de", "bla", "123456");
	
	@Rule
	public ExpectedException expectedException = ExpectedException.none();
	
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
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testCourseInsertMultiple() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		
		expectedException.expect(EntityExistsException.class);
		expectedException.expectMessage(is("Course already exists"));
		
		try {
			CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for course creation");
		}

		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
	}
	
	/**
	 * Tests if a non-registered user can not create a course
	 * *
	 * @throws UnauthorizedException
	 */
	@Test
	public void testCourseInsertAuthorization() throws UnauthorizedException {
		
		expectedException.expect(javax.jdo.JDOObjectNotFoundException.class);
		expectedException.expectMessage(is("User is not registered"));
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(0, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
	}
	
	/**
	 * Tests if a registered user can create the same course more than once
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
	
	/**
	 * Tests if a user can get a course in which he's an owner
	 */
	@Test
	public void testGetCourse() {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		Course retrievedCourse = new Course();
		Long retrievedId = 0L;
		try {
			CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for course creation");
		}
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
		
		try {
			retrievedCourse = CourseEndpointTestHelper.getCourse(1L, testUser);
			retrievedId = retrievedCourse.getId();
		} catch (UnauthorizedException e) {
			fail("User could not be authorized for Course retrieval");
			e.printStackTrace();
		}
		

		Query q = new Query("Course");
		Entity queryResult = ds.prepare(q).asSingleEntity();
		
		assertEquals(Long.valueOf(queryResult.getKey().getId()), retrievedId);
	}
	
	/**
	 * Tests if a user can get a course which doesn't exist
	 */
	@Test
	public void testGetCourseInvalid() {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		
		expectedException.expect(javax.jdo.JDOObjectNotFoundException.class);
		expectedException.expectMessage(is("Course does not exist"));
		
		try {
			CourseEndpointTestHelper.getCourse(1L, testUser);
		} catch (UnauthorizedException e) {
			fail("User could not be authorized for Course retrieval");
			e.printStackTrace();
		}
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(0, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
		
	}
	
	/**
	 * Tests if a user can get a course if he's an Admin
	 */
	@Test
	public void testGetCourseWithAdmin() {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		Course retrievedCourse = new Course();
		Long retrievedId = 0L;
		try {
			CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for course creation");
		}
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
		
		com.google.appengine.api.users.User loggedInUserB = new com.google.appengine.api.users.User("asd@asd.de", "bla", "2");
		UserEndpointTestHelper.addUser("asd@asd.de", "User", "B", loggedInUserB);
		assertEquals(2, ds.prepare(new Query("User")).countEntities(withLimit(10)));

		PersistenceManager mgr = getPersistenceManager();
		try {
			User user = mgr.getObjectById(User.class, loggedInUserB.getUserId());
			user.setType(UserType.ADMIN);
			mgr.makePersistent(user);
		} finally {
			mgr.close();
		}
		
		try {
			retrievedCourse = CourseEndpointTestHelper.getCourse(1L, loggedInUserB);
			retrievedId = retrievedCourse.getId();
		} catch (UnauthorizedException e) {
			fail("User could not be authorized for Course retrieval");
			e.printStackTrace();
		}
		

		Query q = new Query("Course");
		Entity queryResult = ds.prepare(q).asSingleEntity();
		
		assertEquals(Long.valueOf(queryResult.getKey().getId()), retrievedId);
	}
	
	/**
	 * Tests if a registered can list courses
	 */
	@Test
	public void testListCourse() {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CollectionResponse<Course> retrievedCourses = null;
		try {
			CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
			CourseEndpointTestHelper.addCourse(2L, "New Course 2", "A description 2", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for course creation");
		}
				
		try {
			retrievedCourses = (CollectionResponse<Course>) CourseEndpointTestHelper.listCourse(testUser);
		} catch (UnauthorizedException e) {
			fail("User could not be authorized for Course retrieval");
			e.printStackTrace();
		}
		
		assertEquals(2, retrievedCourses.getItems().size());

	}
	
	/**
	 * Tests if a registered can list terms for a course
	 */
	@Test
	public void testListTermCourse() {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		List<TermCourse> retrievedTerms = null;
		try {
			CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for course creation");
		}
		
		try {
			CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
			CourseEndpointTestHelper.addTermCourse(2L, 1L, "A description 2", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for term creation");
		}
				
		try {
			retrievedTerms = CourseEndpointTestHelper.listTermCourse(1L, testUser);
		} catch (UnauthorizedException e) {
			fail("User could not be authorized for Course Term retrieval");
			e.printStackTrace();
		}
		
		assertEquals(2, retrievedTerms.size());

	}
	
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
	
	/**
	 * Tests if Courses from other users can be deleted by an Admin
	 * 
	 * @throws UnauthorizedException
	 */
	@Test
	public void testCourseRemoveAuthWithAdmin() throws UnauthorizedException {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(0, ds.prepare(new Query("User")).countEntities(withLimit(10)));
		com.google.appengine.api.users.User loggedInUserA = new com.google.appengine.api.users.User("asd@asd.de", "bla", "1");
		UserEndpointTestHelper.addUser("asd@asd.de", "User", "A", loggedInUserA);
		assertEquals(1, ds.prepare(new Query("User")).countEntities(withLimit(10)));
		com.google.appengine.api.users.User loggedInUserB = new com.google.appengine.api.users.User("asd@asd.de", "bla", "2");
		UserEndpointTestHelper.addUser("asd@asd.de", "User", "B", loggedInUserB);
		assertEquals(2, ds.prepare(new Query("User")).countEntities(withLimit(10)));

		PersistenceManager mgr = getPersistenceManager();
		try {
			User user = mgr.getObjectById(User.class, loggedInUserB.getUserId());
			user.setType(UserType.ADMIN);
			mgr.makePersistent(user);
		} finally {
			mgr.close();
		}
		
		try {
			CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", loggedInUserA);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for course creation");
		}

		assertEquals(1, ds.prepare(new Query("Course")).countEntities(withLimit(10)));

		CourseEndpointTestHelper.removeCourse(1L, loggedInUserB); // User B should not be able to delete course from user A

		// The course added by User A should still exist
		assertEquals(0, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
	}
	
	
	/**
	 * Tests if a registered user can create a course
	 */
	@Test
	public void testTermCourseInsert() {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		try {
			CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for course creation");
		}

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("TermCourse")).countEntities(withLimit(10)));
	}
	
	/**
	 * Tests if a registered user can create a term more than once
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testTermCourseInsertMultiple() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		
		expectedException.expect(EntityExistsException.class);
		expectedException.expectMessage(is("Term already exists"));
		
		try {
			CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for course creation");
		}

		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("TermCourse")).countEntities(withLimit(10)));
	}
	
	/**
	 * Tests if a registered user can be removed from a course
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testRemoveUser() throws UnauthorizedException {
UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		
		PersistenceManager mgr = getPersistenceManager();
		Course thisCourse = null;
		try {
			CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for course creation");
		}
		
		try {
			CourseEndpointTestHelper.removeUser(1L, testUser);
		} catch (UnauthorizedException e) {
			fail("User could not be authorized for Course removal");
			e.printStackTrace();
		}
		
		javax.jdo.Query q = mgr.newQuery(Course.class);
		q.setFilter("id == theID");
		q.declareParameters("String theID");

		try {
			  @SuppressWarnings("unchecked")
			List<Course> courses = (List<Course>) q.execute(1L);
			  if (!courses.isEmpty()) {
			    	thisCourse = courses.get(0);
			  } else {
				  throw new UnauthorizedException("User " + testUser.getUserId() + " was not found");
			  }
			} finally {
			  q.closeAll();
			}
		
		assertEquals(false, thisCourse.getOwners().contains(testUser.getUserId()));
	}
	
	/**
	 * Tests if a registered user can be removed from a course
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testRemoveUserInvalidCourse() throws UnauthorizedException {
UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		expectedException.expect(javax.jdo.JDOObjectNotFoundException.class);
		expectedException.expectMessage(is("Course does not exist"));
		
		try {
			CourseEndpointTestHelper.removeUser(1L, testUser);
		} catch (UnauthorizedException e) {
			fail("User could not be authorized for Course removal");
			e.printStackTrace();
		}
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(0, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
	}
	
	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
	
}