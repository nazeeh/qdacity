package com.qdacity.test.UserEndpoint;
import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

import javax.jdo.PersistenceManager;

import org.junit.After;
import org.junit.Assert;
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
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.Cache;
import com.qdacity.PMF;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.course.Course;
import com.qdacity.course.TermCourse;
import com.qdacity.endpoint.CourseEndpoint;
import com.qdacity.endpoint.ProjectEndpoint;
import com.qdacity.endpoint.UserEndpoint;
import com.qdacity.project.Project;
import com.qdacity.project.ProjectRevision;
import com.qdacity.project.ProjectType;
import com.qdacity.project.ValidationProject;
import com.qdacity.test.CourseEndpoint.CourseEndpointTestHelper;
import com.qdacity.test.ProjectEndpoint.ProjectEndpointTestHelper;
import com.qdacity.user.LoginProviderType;
import com.qdacity.user.User;
import com.qdacity.user.UserLoginProviderInformation;
import com.qdacity.user.UserType;

public class UserEndpointTest {
	private final LocalTaskQueueTestConfig.TaskCountDownLatch latch = new LocalTaskQueueTestConfig.TaskCountDownLatch(1);
	
	private final CourseEndpoint courseEndpoint = new CourseEndpoint();
	private final ProjectEndpoint projectEndpoint = new ProjectEndpoint();

	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(false).setCallbackClass(LocalTaskQueueTestConfig.DeferredTaskCallback.class).setTaskExecutionLatch(latch));
	private final com.google.api.server.spi.auth.common.User testUser = new AuthenticatedUser("123456", "asd@asd.de", LoginProviderType.GOOGLE);
	
	@Before
	public void setUp() {
		helper.setUp();
	}

	@After
	public void tearDown() {
		latch.reset(1);
		helper.tearDown();
	}
	
	@Rule
	public ExpectedException expectedException = ExpectedException.none();

	@Test
	public void testUserInsert() throws UnauthorizedException {
		AuthenticatedUser loggedInUserA = new AuthenticatedUser("1", "asd@asd.de", LoginProviderType.GOOGLE);
		User returnedUser = UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserA);
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("User")).countEntities(withLimit(10)));
		
		PersistenceManager mgr = getPersistenceManager();
		try {
			User insertedUser = mgr.getObjectById(User.class, returnedUser.getId());
			assertEquals(1, insertedUser.getLoginProviderInformation().size());
			UserLoginProviderInformation loginInfo = insertedUser.getLoginProviderInformation().get(0);
			assertEquals(loggedInUserA.getId(), loginInfo.getExternalUserId());
			assertEquals(loggedInUserA.getProvider(), loginInfo.getProvider());
		} finally {
			mgr.close();
		}
	}
	
	@Test(expected = IllegalArgumentException.class)
	public void testUserInsertNotAuthenticatedUser() throws UnauthorizedException {
		com.google.api.server.spi.auth.common.User loggedInUserA = new com.google.api.server.spi.auth.common.User("1", "asd@asd.de");
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserA);
	}
	
	@Test
	public void testGetUser() throws UnauthorizedException {
		latch.reset(2);
		User user = null;
		com.google.api.server.spi.auth.common.User loggedInUserA = new AuthenticatedUser("1", "asd@asd.de", LoginProviderType.GOOGLE);

		User insertedUser = UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserA);
		UserEndpoint ue = new UserEndpoint();
		try {
			user = ue.getUser(insertedUser.getId(), loggedInUserA);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}
		assertEquals("firstName", user.getGivenName());

		ProjectEndpointTestHelper.setupProjectWithCodesystem(1L, "", "", loggedInUserA);

		PersistenceManager mgr = getPersistenceManager();
		Date time = new Date();
		time.setTime(0);
		user.setLastLogin(time);
		user.setLastProjectId(1L);
		user.setLastProjectType(ProjectType.PROJECT);
		mgr.makePersistent(user);
		Cache.cache(user.getId(), User.class, user);
		mgr.close();
		try {
			user = ue.getUser(insertedUser.getId(), loggedInUserA);
			assertTrue(((new Date()).getTime() - user.getLastLogin().getTime()) < 1000);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}

		try {
			latch.await(10, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
			fail("Deferred task did not finish in time");
		}

		Project prj = (Project) Cache.get(1L, Project.class);
		assertTrue(prj != null);

	}
	
	@Test
	public void testUserDelete() throws UnauthorizedException {		
		com.google.api.server.spi.auth.common.User loggedInUserA = new AuthenticatedUser("1", "asd@asd.de", LoginProviderType.GOOGLE);
		User insertedUser = UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserA);

		UserEndpoint ue = new UserEndpoint();
		try {
			ue.removeUser(insertedUser.getId(), loggedInUserA);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(0, ds.prepare(new Query("User")).countEntities(withLimit(10)));
	}
	
	@Test
	public void testUserDeleteProjectOwnerRemoved() throws UnauthorizedException {		
		com.google.api.server.spi.auth.common.User loggedInUserA = new AuthenticatedUser("1", "asd@asd.de", LoginProviderType.GOOGLE);
		User insertedUserA = UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserA);
		User insertedTestUser = UserEndpointTestHelper.addUser("test@abc.de", "test", "abc", testUser);
		
		Project createdProject = ProjectEndpointTestHelper.addProject(1L, "test_project", "description", 2L, loggedInUserA);
		createdProject = projectEndpoint.addOwner(1L, insertedUserA.getId(), loggedInUserA);
		createdProject = projectEndpoint.addOwner(1L, insertedTestUser.getId(), testUser);
		
		assertEquals(2, createdProject.getOwners().size());

		UserEndpoint ue = new UserEndpoint();
		try {
			ue.removeUser(insertedUserA.getId(), loggedInUserA);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}
		createdProject = ProjectEndpointTestHelper.getProject(1L, testUser);
		assertEquals(1, createdProject.getOwners().size());
	}
	
	@Test(expected=javax.jdo.JDOObjectNotFoundException.class)
	public void testUserDeleteProjectOwnerDeleted() throws UnauthorizedException {		
		User insertedTestUser = UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		
		Project project = ProjectEndpointTestHelper.addProject(1L, "test_project", "description", 2L, testUser);
		project = projectEndpoint.addOwner(1L, insertedTestUser.getId(), testUser);
		
		assertEquals(1, project.getOwners().size());

		UserEndpoint ue = new UserEndpoint();
		try {
			ue.removeUser(insertedTestUser.getId(), testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}
		PersistenceManager mgr = getPersistenceManager();
		try {
			mgr.getObjectById(Project.class, project.getId());
		} finally {
			mgr.close();
		}
	}
	
	@Test
	public void testUserDeleteCourseOwnerRemoved() throws UnauthorizedException {		
		com.google.api.server.spi.auth.common.User loggedInUserA = new AuthenticatedUser("1", "asd@asd.de", LoginProviderType.GOOGLE);
		User insertedUserA = UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserA);
		User insertedTestUser = UserEndpointTestHelper.addUser("test@abc.de", "test", "abc", testUser);
		
		Course course = CourseEndpointTestHelper.addCourse(1L, "test_project", "description", loggedInUserA);
		course = courseEndpoint.addCourseOwner(1L, insertedUserA.getId(), loggedInUserA);
		course = courseEndpoint.addCourseOwner(1L, insertedTestUser.getId(), loggedInUserA);
		
		assertEquals(2, course.getOwners().size());

		UserEndpoint ue = new UserEndpoint();
		try {
			ue.removeUser(insertedUserA.getId(), loggedInUserA);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}
		course = CourseEndpointTestHelper.getCourse(1L, testUser);
		assertEquals(1, course.getOwners().size());
	}
	
	@Test(expected=javax.jdo.JDOObjectNotFoundException.class)
	public void testUserDeleteCourseOwnerDeleted() throws UnauthorizedException {		
		User insertedTestUser = UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		
		Course course = CourseEndpointTestHelper.addCourse(1L, "test_project", "description", testUser);
		course = courseEndpoint.addCourseOwner(1L, insertedTestUser.getId(), testUser);
		
		assertEquals(1, course.getOwners().size());

		UserEndpoint ue = new UserEndpoint();
		try {
			ue.removeUser(insertedTestUser.getId(), testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}
		PersistenceManager mgr = getPersistenceManager();
		try {
			mgr.getObjectById(Course.class, course.getId());
		} finally {
			mgr.close();
		}
	}
	
	@Test(expected=javax.jdo.JDOObjectNotFoundException.class)
	public void testUserDeleteTermCourseOwnerDeleted() throws UnauthorizedException {		
		User insertedTestUser = UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		
		TermCourse termCourse = CourseEndpointTestHelper.addTermCourse(1L, testUser);
		// user is set to owner
		
		assertEquals(1, termCourse.getOwners().size());

		UserEndpoint ue = new UserEndpoint();
		try {
			ue.removeUser(insertedTestUser.getId(), testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}
		PersistenceManager mgr = getPersistenceManager();
		try {
			mgr.getObjectById(TermCourse.class, termCourse.getId());
		} finally {
			mgr.close();
		}
	}

	@Test
	public void testUserDeleteValidationProjectOwnerRemoved() throws UnauthorizedException {		
		User insertedTestUser = UserEndpointTestHelper.addUser("test@abc.de", "test", "abc", testUser);
		
		ProjectEndpointTestHelper.setupProjectWithCodesystem(1L, "coding system test", "test", testUser);
		ProjectRevision revision = projectEndpoint.createSnapshot(1L, "testComment", testUser);
		ValidationProject validationProject = projectEndpoint.createValidationProject(revision.getId(), insertedTestUser.getId(), testUser);
		// creator automatically added validation coder
		
		assertEquals(1, validationProject.getValidationCoders().size());

		UserEndpoint ue = new UserEndpoint();
		try {
			ue.removeUser(testUser.getId(), testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}
		
		PersistenceManager mgr = getPersistenceManager();
		try {
			validationProject = mgr.getObjectById(ValidationProject.class, validationProject.getId());
			assertEquals(1, validationProject.getValidationCoders().size());
		} finally {
			mgr.close();
		}
	}	
	
	
	@Test
	public void testUserDeleteAuthorization() throws UnauthorizedException {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(0, ds.prepare(new Query("User")).countEntities(withLimit(10)));

		com.google.api.server.spi.auth.common.User loggedInUserA = new AuthenticatedUser("1", "asd@asd.de", LoginProviderType.GOOGLE);
		User insertedUserA = UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserA);
		assertEquals(1, ds.prepare(new Query("User")).countEntities(withLimit(10)));

		com.google.api.server.spi.auth.common.User loggedInUserB = new AuthenticatedUser("2", "asd@asd.de", LoginProviderType.GOOGLE);
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserB);
		assertEquals(2, ds.prepare(new Query("User")).countEntities(withLimit(10)));

		UserEndpoint ue = new UserEndpoint();
		try {
			ue.removeUser(insertedUserA.getId(), loggedInUserB); // User B should not be able to delete User B
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

		com.google.api.server.spi.auth.common.User loggedInUserA = new AuthenticatedUser("1", "asd@asd.de", LoginProviderType.GOOGLE);
		User insertedUser = UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserA);
		assertEquals(1, ds.prepare(new Query("User")).countEntities(withLimit(10)));

		com.google.api.server.spi.auth.common.User loggedInUserB = new AuthenticatedUser("2", "asd@asd.de", LoginProviderType.GOOGLE);

		UserEndpoint ue = new UserEndpoint();
		expectedException.expect(UnauthorizedException.class);
		expectedException.expectMessage(is("User is not registered"));

		ue.removeUser(insertedUser.getId(), loggedInUserB); // User B should not be able to delete User B


		assertEquals(2, ds.prepare(new Query("User")).countEntities(withLimit(10)));
	}

	@Test
	public void testFindUser() throws UnauthorizedException {
		List<User> test = new ArrayList<User>();
		com.google.api.server.spi.auth.common.User loggedInUserA = new AuthenticatedUser("1", "asd@asd.de", LoginProviderType.GOOGLE);
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
	public void testUpdateUserType() throws UnauthorizedException {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();

		com.google.api.server.spi.auth.common.User loggedInUserA = new AuthenticatedUser("1", "asd@asd.de", LoginProviderType.GOOGLE);
		User insertedUser = UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserA);

		PersistenceManager mgr = getPersistenceManager();
		mgr.setIgnoreCache(true);
		try {
			User user = mgr.getObjectById(User.class, "1");
			assertEquals(UserType.USER, user.getType());

			UserEndpoint ue = new UserEndpoint();
			try {
				user = ue.updateUserType(insertedUser.getId(), "ADMIN", loggedInUserA);
			} catch (UnauthorizedException e) {
				e.printStackTrace();
				fail("User could not be authorized");
			}
			User user2 = mgr.getObjectById(User.class, insertedUser.getId());
			assertEquals(UserType.ADMIN, user.getType());
		} finally {
			mgr.close();
		}
	}

	@Test
	public void testListUserByCourse() throws UnauthorizedException {
		com.google.api.server.spi.auth.common.User loggedInUserA = new AuthenticatedUser("1", "asd@asd.de", LoginProviderType.GOOGLE);
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", loggedInUserA);
		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", loggedInUserA);
		
		List<User> users = null;
		UserEndpoint ue = new UserEndpoint();
		try {
			users = ue.listUserByCourse(null, null, 1L, loggedInUserA);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}
		assertEquals(1, users.size());
		
	}
	
	@Test(expected = UnauthorizedException.class)
	public void testGetCurrentUserNullUser() throws UnauthorizedException {
		UserEndpoint ue = new UserEndpoint();
		ue.getCurrentUser(null);
	}
	
	@Test(expected = IllegalArgumentException.class)
	public void testGetCurrentUserNoAuthenticatedUser() throws UnauthorizedException {
		com.google.api.server.spi.auth.common.User noAuthenticatedUser = new com.google.api.server.spi.auth.common.User("123456", "asd@asd.de");
		
		UserEndpoint ue = new UserEndpoint();
		ue.getCurrentUser(noAuthenticatedUser);
	}
	
	@Test(expected = UnauthorizedException.class)
	public void testGetCurrentUserNoAssociatedUsers() throws UnauthorizedException {
		UserEndpoint ue = new UserEndpoint();
		ue.getCurrentUser(testUser);
	}
	
	@Test
	public void testGetCurrentUserOneAssociatedUsers() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("abc@test.de", "abc", "test", testUser);
		
		UserEndpoint ue = new UserEndpoint();
		User retrievedUser = ue.getCurrentUser(testUser);
		
		Assert.assertEquals(testUser.getId(), retrievedUser.getId());
	}
	
	
	
	
	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}