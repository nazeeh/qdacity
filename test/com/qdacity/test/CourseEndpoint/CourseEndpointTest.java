package com.qdacity.test.CourseEndpoint;

import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.util.List;

import javax.jdo.PersistenceManager;
import javax.persistence.EntityExistsException;

import com.google.api.server.spi.response.BadRequestException;
import com.qdacity.endpoint.UserGroupEndpoint;
import com.qdacity.user.UserGroup;
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
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.PMF;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.course.Course;
import com.qdacity.course.TermCourse;
import com.qdacity.endpoint.CourseEndpoint;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;
import com.qdacity.user.LoginProviderType;
import com.qdacity.user.User;
import com.qdacity.user.UserType;

public class CourseEndpointTest {

	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml"));
	private final com.google.api.server.spi.auth.common.User testUser = new AuthenticatedUser("123456", "asd@asd.de", LoginProviderType.GOOGLE);
	private final com.google.api.server.spi.auth.common.User testUser2 = new AuthenticatedUser("12345678", "asdf@asdf.de", LoginProviderType.GOOGLE);
	
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
	 * Tests if a registered user can create a course more than once
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testCourseInsertMultiple() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		
		expectedException.expect(EntityExistsException.class);
		expectedException.expectMessage(is("Course already exists"));
		
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
	}
	
	/**
	 * Tests if a non-registered user can not create a course
	 * *
	 */
	@Test
	public void testCourseInsertAuthorization() throws UnauthorizedException {
		
		expectedException.expect(UnauthorizedException.class);
		expectedException.expectMessage(is("User is not registered"));
		
		CourseEndpoint ce = new CourseEndpoint();
		Course course = new Course();
		course.setId(1L);
		course.setName("New Course");
		course.setDescription("A description");
		ce.insertCourse(course, testUser);

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(0, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
	}
	
	/**
	 * Tests if a registered user can create a course
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testCourseInsert() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
	}
	
	/**
	 * Tests if a user can delete his own course
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testCourseRemove() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
		CourseEndpointTestHelper.removeCourse(1L, testUser);
		assertEquals(0, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
	}
	
	/**
	 * Tests if a user can get a course in which he's an owner
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testGetCourse() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		Course retrievedCourse = new Course();
		Long retrievedId = 0L;
		
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
		retrievedCourse = CourseEndpointTestHelper.getCourse(1L, testUser);
		retrievedId = retrievedCourse.getId();

		Query q = new Query("Course");
		Entity queryResult = ds.prepare(q).asSingleEntity();
		
		assertEquals(Long.valueOf(queryResult.getKey().getId()), retrievedId);
	}
	
	/**
	 * Tests if a user can get a course which doesn't exist
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testGetCourseInvalid() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		
		expectedException.expect(javax.jdo.JDOObjectNotFoundException.class);
		expectedException.expectMessage(is("Course does not exist"));

		CourseEndpoint ce = new CourseEndpoint();
		ce.getCourse(1L, testUser);

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(0, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
		
	}
	
	/**
	 * Tests if a user can get a course if he's an Admin
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testGetCourseWithAdmin() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		Course retrievedCourse = new Course();
		Long retrievedId = 0L;
		
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
		
		com.google.api.server.spi.auth.common.User loggedInUserB = new AuthenticatedUser("2", "asd@asd.de", LoginProviderType.GOOGLE);
		User addedLoggedInUserB = UserEndpointTestHelper.addUser("asd@asd.de", "User", "B", loggedInUserB);
		assertEquals(2, ds.prepare(new Query("User")).countEntities(withLimit(10)));

		PersistenceManager mgr = getPersistenceManager();
		try {
			User user = mgr.getObjectById(User.class, addedLoggedInUserB.getId());
			user.setType(UserType.ADMIN);
			mgr.makePersistent(user);
		} finally {
			mgr.close();
		}
		
		retrievedCourse = CourseEndpointTestHelper.getCourse(1L, loggedInUserB);
		retrievedId = retrievedCourse.getId();
		
		Query q = new Query("Course");
		Entity queryResult = ds.prepare(q).asSingleEntity();
		
		assertEquals(Long.valueOf(queryResult.getKey().getId()), retrievedId);
	}
	
	/**
	 * Tests if a registered can list courses
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testListCourse() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CollectionResponse<Course> retrievedCourses = null;
		
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		CourseEndpointTestHelper.addCourse(2L, "New Course 2", "A description 2", testUser);

		retrievedCourses = (CollectionResponse<Course>) CourseEndpointTestHelper.listCourse(testUser);
		
		assertEquals(2, retrievedCourses.getItems().size());
	}
	
	/**
	 * Tests if a user can get a term course which doesn't exist
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testGetTermCourseInvalid() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		
		expectedException.expect(javax.jdo.JDOObjectNotFoundException.class);
		expectedException.expectMessage(is("Term Course does not exist"));

		CourseEndpoint ce = new CourseEndpoint();
		ce.getTermCourse(1L, testUser);

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(0, ds.prepare(new Query("TermCourse")).countEntities(withLimit(10)));
		
	}
	
	/**
	 * Tests if a user can delete his own course
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testTermCourseRemove() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		CourseEndpointTestHelper.addTermCourse(1L, testUser);
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("TermCourse")).countEntities(withLimit(10)));
		CourseEndpointTestHelper.removeTermCourse(1L, testUser);
		assertEquals(0, ds.prepare(new Query("TermCourse")).countEntities(withLimit(10)));
	}
	
	/**
	 * Tests if a registered can list terms for a course
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testListTermCourse() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		List<TermCourse> retrievedTerms = null;
		
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(2L, 1L, "A description 2", testUser);
		
		retrievedTerms = CourseEndpointTestHelper.listTermCourse(1L, testUser);
		
		assertEquals(2, retrievedTerms.size());

	}
	
	/**
	 * Tests if a registered can list terms for a course
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testListTermCourseByParticipant() throws UnauthorizedException {
		User addedTestUser = UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		List<TermCourse> retrievedTerms = null;
		
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(2L, 1L, "A description", testUser);
		CourseEndpointTestHelper.addParticipantTermCourse(1L, addedTestUser.getId(), testUser);
		CourseEndpointTestHelper.addParticipantTermCourse(2L, addedTestUser.getId(), testUser);
		
		retrievedTerms = CourseEndpointTestHelper.listTermCourseByParticipant(1L, testUser);
		
		assertEquals(2, retrievedTerms.size());

	}
	
	/**
	 * Tests if a user can get a term course in which he's an owner 
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testGetTermCourse() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		TermCourse retrievedCourse = new TermCourse();
		Long retrievedId = 0L;
		
		CourseEndpointTestHelper.addTermCourse(1L, testUser);
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("TermCourse")).countEntities(withLimit(10)));
		retrievedCourse = CourseEndpointTestHelper.getTermCourse(1L, testUser);
		retrievedId = retrievedCourse.getId();

		Query q = new Query("TermCourse");
		Entity queryResult = ds.prepare(q).asSingleEntity();
		
		assertEquals(Long.valueOf(queryResult.getKey().getId()), retrievedId);
	}
	
	
	/**
	 * Tests if a user can become a participant of a term course
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testAddParticipant() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		
		
		PersistenceManager mgr = getPersistenceManager();
		TermCourse thisCourse = new TermCourse();
		
		CourseEndpointTestHelper.addTermCourse(1L, testUser);
		CourseEndpointTestHelper.addParticipantTermCourse(1L, testUser.getId(), testUser);
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("TermCourse")).countEntities(withLimit(10)));
		
		javax.jdo.Query q = mgr.newQuery(TermCourse.class);
		q.setFilter("id == theID");
		q.declareParameters("String theID");

		try {
			  @SuppressWarnings("unchecked")
			List<TermCourse> termCourses = (List<TermCourse>) q.execute(1L);
			  if (!termCourses.isEmpty()) {
			    	thisCourse = termCourses.get(0);
			  }
			} finally {
			  q.closeAll();
			}
		
		assertEquals(true, thisCourse.getParticipants().contains(testUser.getId()));
		
	}
	
	/**
	 * Tests if a user can become a participant of a term course
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testRemoveParticipant() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		
		PersistenceManager mgr = getPersistenceManager();
		TermCourse thisCourse = new TermCourse();
		
		CourseEndpointTestHelper.addTermCourse(1L, testUser);
		CourseEndpointTestHelper.addParticipantTermCourse(1L, testUser.getId(), testUser);
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("TermCourse")).countEntities(withLimit(10)));
		
		CourseEndpointTestHelper.removeParticipantTermCourse(1L, testUser.getId(), testUser);
		javax.jdo.Query q = mgr.newQuery(TermCourse.class);
		q.setFilter("id == theID");
		q.declareParameters("String theID");

		try {
			  @SuppressWarnings("unchecked")
			List<TermCourse> termCourses = (List<TermCourse>) q.execute(1L);
			  if (!termCourses.isEmpty()) {
			    	thisCourse = termCourses.get(0);
			  }
			} finally {
			  q.closeAll();
			}
		
		assertEquals(false, thisCourse.getParticipants().contains(testUser.getId()));
		
	}
	
	/**
	 * Tests if a user can become a participant of a term course
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testAddSetStatus() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		
		PersistenceManager mgr = getPersistenceManager();
		TermCourse thisCourse = new TermCourse();
		
		CourseEndpointTestHelper.addTermCourse(1L, testUser);
		CourseEndpointTestHelper.setTermCourseStatus(1L, true, testUser);	
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("TermCourse")).countEntities(withLimit(10)));
		
		
		javax.jdo.Query q = mgr.newQuery(TermCourse.class);
		q.setFilter("id == theID");
		q.declareParameters("String theID");

		try {
			  @SuppressWarnings("unchecked")
			List<TermCourse> termCourses = (List<TermCourse>) q.execute(1L);
			  if (!termCourses.isEmpty()) {
			    	thisCourse = termCourses.get(0);
			  }
			} finally {
			  q.closeAll();
			}
		
		assertEquals(true, thisCourse.isOpen());
		
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
		com.google.api.server.spi.auth.common.User loggedInUserA = new AuthenticatedUser("1", "asd@asd.de", LoginProviderType.GOOGLE);
		UserEndpointTestHelper.addUser("asd@asd.de", "User", "A", loggedInUserA);
		assertEquals(1, ds.prepare(new Query("User")).countEntities(withLimit(10)));
		com.google.api.server.spi.auth.common.User loggedInUserB = new AuthenticatedUser("2", "asd@asd.de", LoginProviderType.GOOGLE);
		UserEndpointTestHelper.addUser("asd@asd.de", "User", "B", loggedInUserB);
		assertEquals(2, ds.prepare(new Query("User")).countEntities(withLimit(10)));

		
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", loggedInUserA);
		

		assertEquals(1, ds.prepare(new Query("Course")).countEntities(withLimit(10)));

		expectedException.expect(UnauthorizedException.class);
		expectedException.expectMessage(is("User is Not Authorized"));
		CourseEndpoint ce = new CourseEndpoint();
		ce.removeCourse(1L, loggedInUserB); // User B should not be able to delete course from user A

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
		com.google.api.server.spi.auth.common.User loggedInUserA = new AuthenticatedUser("1", "asd@asd.de", LoginProviderType.GOOGLE);
		UserEndpointTestHelper.addUser("asd@asd.de", "User", "A", loggedInUserA);
		assertEquals(1, ds.prepare(new Query("User")).countEntities(withLimit(10)));
		com.google.api.server.spi.auth.common.User loggedInUserB = new AuthenticatedUser("2", "asd@asd.de", LoginProviderType.GOOGLE);
		User addedLoggedInUserB = UserEndpointTestHelper.addUser("asd@asd.de", "User", "B", loggedInUserB);
		assertEquals(2, ds.prepare(new Query("User")).countEntities(withLimit(10)));

		PersistenceManager mgr = getPersistenceManager();
		try {
			User user = mgr.getObjectById(User.class, addedLoggedInUserB.getId());
			user.setType(UserType.ADMIN);
			mgr.makePersistent(user);
		} finally {
			mgr.close();
		}
		
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", loggedInUserA);
		
		assertEquals(1, ds.prepare(new Query("Course")).countEntities(withLimit(10)));

		CourseEndpointTestHelper.removeCourse(1L, loggedInUserB); // User B should  be able to delete course from user A because he's an Admin

		// The course added by User A should not exist
		assertEquals(0, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
	}
	
	
	/**
	 * Tests if a registered user can create a term course
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testTermCourseInsert() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("TermCourse")).countEntities(withLimit(10)));
	}
	
	/**
	 * Tests if a non registered user can create a course
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testTermCourseInsertNonReg() throws UnauthorizedException {
		
		expectedException.expect(UnauthorizedException.class);
		expectedException.expectMessage(is("User is not registered"));

		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(0, ds.prepare(new Query("TermCourse")).countEntities(withLimit(10)));
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
		
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
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
		
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		CourseEndpointTestHelper.removeUser(1L, testUser);
		
		javax.jdo.Query q = mgr.newQuery(Course.class);
		q.setFilter("id == theID");
		q.declareParameters("String theID");

		try {
			  @SuppressWarnings("unchecked")
			List<Course> courses = (List<Course>) q.execute(1L);
			  if (!courses.isEmpty()) {
			    	thisCourse = courses.get(0);
			  } else {
				  throw new UnauthorizedException("User " + testUser.getId() + " was not found");
			  }
			} finally {
			  q.closeAll();
			}
		
		assertEquals(false, thisCourse.getOwners().contains(testUser.getId()));
	}
	
	/**
	 * Tests if a registered user can be removed from a course that doesn't exist
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testRemoveUserInvalidCourse() throws UnauthorizedException {
UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		expectedException.expect(javax.jdo.JDOObjectNotFoundException.class);
		expectedException.expectMessage(is("Course does not exist"));

		CourseEndpointTestHelper.removeUser(1L, testUser);
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(0, ds.prepare(new Query("Course")).countEntities(withLimit(10)));
	}
	
	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
	
	/**
	 * Tests if a registered user can be added as an owner by another owner of a course
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testAddCourseOwner() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		
		PersistenceManager mgr = getPersistenceManager();
		Course thisCourse = null;
		
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		CourseEndpointTestHelper.addCourseOwner(1L, testUser.getId(), testUser);
		
		javax.jdo.Query q = mgr.newQuery(Course.class);
		q.setFilter("id == theID");
		q.declareParameters("String theID");

		try {
			  @SuppressWarnings("unchecked")
			List<Course> courses = (List<Course>) q.execute(1L);
			  if (!courses.isEmpty()) {
			    	thisCourse = courses.get(0);
			  } else {
				  throw new UnauthorizedException("User " + testUser.getId() + " was not found");
			  }
			} finally {
			  q.closeAll();
			}
		
		assertEquals(true, thisCourse.getOwners().contains(testUser.getId()));
	}
	
	/**
	 * Tests if a registered user can be added as an owner by non owner of a course
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testAddCourseOwnerNoAuth() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser2);
		
		PersistenceManager mgr = getPersistenceManager();
		Course thisCourse = null;
		
		expectedException.expect(UnauthorizedException.class);
		expectedException.expectMessage(is("User is Not Authorized"));
		
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		CourseEndpoint ce = new CourseEndpoint();
		ce.addCourseOwner(1L, "2", testUser2);
		
		javax.jdo.Query q = mgr.newQuery(Course.class);
		q.setFilter("id == theID");
		q.declareParameters("String theID");

		try {
			  @SuppressWarnings("unchecked")
			List<Course> courses = (List<Course>) q.execute(1L);
			  if (!courses.isEmpty()) {
			    	thisCourse = courses.get(0);
			  } else {
				  throw new UnauthorizedException("User " + testUser.getId() + " was not found");
			  }
			} finally {
			  q.closeAll();
			}
		
		assertEquals(false, thisCourse.getOwners().contains(testUser.getId()));
	}
	
	/**
	 * Tests if a registered user can be invited to be an owner by another owner of a course
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testInviteUserCourse() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		User addedTestUser2 = UserEndpointTestHelper.addUser("asdf@asdf.de", "firstName", "lastName", testUser2);
		
		PersistenceManager mgr = getPersistenceManager();
		Course thisCourse = null;
		
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		CourseEndpoint ce = new CourseEndpoint();
		ce.inviteUserCourse(1L, testUser2.getEmail(), testUser);
		
		javax.jdo.Query q = mgr.newQuery(Course.class);
		q.setFilter("id == theID");
		q.declareParameters("String theID");

		try {
			  @SuppressWarnings("unchecked")
			List<Course> courses = (List<Course>) q.execute(1L);
			  if (!courses.isEmpty()) {
			    	thisCourse = courses.get(0);
			  } else {
				  throw new UnauthorizedException("User " + testUser.getId() + " was not found");
			  }
			} finally {
			  q.closeAll();
			}
		
		assertEquals(true, thisCourse.getInvitedUsers().contains(addedTestUser2.getId()));
	}
	
	/**
	 * Tests if a registered user can be invited to be an owner by another owner of a course
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testInviteUserTermCourse() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		User addedTestUser2 = UserEndpointTestHelper.addUser("asdf@asdf.de", "firstName", "lastName", testUser2);
		
		PersistenceManager mgr = getPersistenceManager();
		TermCourse thisTermCourse = null;
		
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, testUser);
		CourseEndpoint ce = new CourseEndpoint();
		ce.inviteUserTermCourse(1L, testUser2.getEmail(), testUser);
		
		javax.jdo.Query q = mgr.newQuery(TermCourse.class);
		q.setFilter("id == theID");
		q.declareParameters("String theID");

		try {
			  @SuppressWarnings("unchecked")
			List<TermCourse> termCourses = (List<TermCourse>) q.execute(1L);
			  if (!termCourses.isEmpty()) {
			    	thisTermCourse = termCourses.get(0);
			  } else {
				  throw new UnauthorizedException("User " + testUser.getId() + " was not found");
			  }
			} finally {
			  q.closeAll();
			}
		
		assertEquals(true, thisTermCourse.getInvitedUsers().contains(addedTestUser2.getId()));
	}
	
	/**
	 * Tests if a registered user can accept an invitation to be an owner of a course
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testAddCourseOwnerInvited() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		UserEndpointTestHelper.addUser("asdf@asdf.de", "firstName", "lastName", testUser2);
		
		PersistenceManager mgr = getPersistenceManager();
		Course thisCourse = null;
		
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		CourseEndpoint ce = new CourseEndpoint();
		
		ce.inviteUserCourse(1L, testUser2.getEmail(), testUser);
		ce.addCourseOwner(1L, testUser2.getId(), testUser2);
		
		javax.jdo.Query q = mgr.newQuery(Course.class);
		q.setFilter("id == theID");
		q.declareParameters("String theID");

		try {
			  @SuppressWarnings("unchecked")
			List<Course> courses = (List<Course>) q.execute(1L);
			  if (!courses.isEmpty()) {
			    	thisCourse = courses.get(0);
			  } else {
				  throw new UnauthorizedException("User " + testUser2.getId() + " was not found");
			  }
			} finally {
			  q.closeAll();
			}
		
		assertEquals(true, thisCourse.getOwners().contains(testUser2.getId()));
	}
	
	/**
	 * Tests if a registered user can list participants of a termCourse
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testListTermCourseParticipants() throws UnauthorizedException {
		User addedTestUser = UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CollectionResponse<User> users = null;
		
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(2L, testUser);
		CourseEndpointTestHelper.addParticipantTermCourse(2L, addedTestUser.getId(), testUser);
		
		users = (CollectionResponse<User>) CourseEndpointTestHelper.listTermCourseParticipants(2L, testUser);
		
		assertEquals(1, users.getItems().size());
	}

	/**
	 * Tests that inserting courses and listing of courses for a user group works.
	 */
	@Test
	public void testListCourseForUserGroup() throws UnauthorizedException, BadRequestException {
		com.google.api.server.spi.auth.common.User loggedInUser = new AuthenticatedUser("123456", "asd@asd.de", LoginProviderType.GOOGLE);
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUser);

		UserGroup userGroup = new UserGroupEndpoint().insertUserGroup("testGroup", loggedInUser);
		Course course = new Course();
		 try {
			 course = new CourseEndpoint().insertCourseForUserGroup(course, userGroup.getId(), loggedInUser);
			 assertTrue(course.getOwningUserGroups().contains(userGroup.getId()));
		 } catch (UnauthorizedException e) {
		 	e.printStackTrace();
			fail("User could not be authorized for course creation");
		 }
		 try {
		 	CollectionResponse<Course> courses = new CourseEndpoint().listCourseByUserGroupId(null, null, userGroup.getId(), loggedInUser);
		 	assertEquals(1, courses.getItems().size());
		 	assertTrue(courses.getItems().iterator().next().getOwningUserGroups().contains(userGroup.getId()));
		 } catch (UnauthorizedException e) {
		 	e.printStackTrace();
		 	fail("Failed to authorize the user for listing his courses");
		 }
		 userGroup = new UserGroupEndpoint().getUserGroupById(userGroup.getId(), loggedInUser);
		 assertTrue(userGroup.getCourses().contains(course.getId()));
	}

	/**
	 * Tests that inserting term courses and listing of term courses for a user group works.
	 */
	@Test
	public void testListTermCourseForUserGroup() throws UnauthorizedException, BadRequestException {
		com.google.api.server.spi.auth.common.User loggedInUser = new AuthenticatedUser("123456", "asd@asd.de", LoginProviderType.GOOGLE);
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUser);

		UserGroup userGroup = new UserGroupEndpoint().insertUserGroup("testGroup", loggedInUser);

		Course parentCourse = new Course();
		parentCourse = new CourseEndpoint().insertCourseForUserGroup(parentCourse, userGroup.getId(), loggedInUser);

		TermCourse termCourse = new TermCourse();
		termCourse.setCourseID(parentCourse.getId());
		try {
			termCourse = new CourseEndpoint().insertTermCourseForUserGroup(termCourse, userGroup.getId(), loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for term course creation");
		}
		try {
			List<TermCourse> courses = new CourseEndpoint().listTermCourseByUserGroupId(userGroup.getId(), loggedInUser);
			assertEquals(1, courses.size());
			assertEquals(termCourse.getId(), courses.get(0).getId());
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("Failed to authorize the user for listing his courses");
		}
	}
}