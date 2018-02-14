package com.qdacity.test.ExerciseEndpoint;

import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.junit.Assert.assertEquals;
import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.endpoint.ProjectEndpoint;
import com.qdacity.exercise.Exercise;
import com.qdacity.exercise.ExerciseProject;
import com.qdacity.project.ProjectRevision;
import com.qdacity.test.CodeSystemEndpoint.CodeSystemTestHelper;
import com.qdacity.test.CourseEndpoint.CourseEndpointTestHelper;
import com.qdacity.test.ProjectEndpoint.ProjectEndpointTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;
import com.qdacity.user.LoginProviderType;

public class ExerciseEndpointTest {

	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml"));
	private final com.google.api.server.spi.auth.common.User testUser = new AuthenticatedUser("123456", "asd@asd.de", LoginProviderType.GOOGLE);

	@Before
	public void setUp() {
		helper.setUp();
	}

	@After
	public void tearDown() {
		helper.tearDown();
	}


	/**
	 * Tests if a registered user can create an exercise
	 * @throws UnauthorizedException
	 */
	@Test
	public void testExerciseInsert() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", testUser);

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("Exercise")).countEntities(withLimit(10)));
	}



	/**
	 * Tests if a user can delete his own exercise
	 * @throws UnauthorizedException
	 */
	@Test
	public void testExerciseRemove() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		ExerciseEndpointTestHelper.addExercise(1L, 1L, "ex 1", testUser);

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("Exercise")).countEntities(withLimit(10)));
		ExerciseEndpointTestHelper.removeExercise(1L, testUser);

		assertEquals(0, ds.prepare(new Query("Exercise")).countEntities(withLimit(10)));
	}

	/**
	 * Tests if a registered can list exercises
	 * @throws UnauthorizedException
	 */
	@Test
	public void testListExercise() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", testUser);

		List<Exercise> retrievedExercises = null;

		retrievedExercises = (List<Exercise>) ExerciseEndpointTestHelper.listExercises(1L, testUser);

		assertEquals(1, retrievedExercises.size());
	}

	/**
	 * Tests if a registered user can get an exerciseProject by its revision id
	 * @throws UnauthorizedException
	 */
	@Test
	public void getExerciseProjectByRevisionIDTest() throws UnauthorizedException {
		ProjectEndpoint pe = new ProjectEndpoint();

		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CodeSystemTestHelper.addCodeSystem(2L, testUser);
		ProjectEndpointTestHelper.addProject(1L, "A name", "A description", 2L, testUser);
		ProjectRevision revision = pe.createSnapshot(1L, "A test revision", testUser);
		CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", testUser);
		ExerciseEndpointTestHelper.createExerciseProject(revision.getId(), 1L, testUser);
		ExerciseProject exerciseProject = ExerciseEndpointTestHelper.getExerciseProjectByRevisionID(revision.getId(), testUser);

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query("ExerciseProject");
		Entity queryResult = ds.prepare(q).asSingleEntity();

		assertEquals(Long.valueOf(queryResult.getKey().getId()), exerciseProject.getId());
	}

	/**
	 * Tests if a registered user can get an exerciseProject by its revision id
	 * @throws UnauthorizedException
	 */
	@Test
	public void getExerciseProjectsByExerciseIDTest() throws UnauthorizedException {
		ProjectEndpoint pe = new ProjectEndpoint();

		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CodeSystemTestHelper.addCodeSystem(2L, testUser);
		ProjectEndpointTestHelper.addProject(1L, "A name", "A description", 2L, testUser);
		ProjectRevision revision = pe.createSnapshot(1L, "A test revision", testUser);
		CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", testUser);
		ExerciseEndpointTestHelper.createExerciseProject(revision.getId(), 1L, testUser);
		ExerciseEndpointTestHelper.createExerciseProject(revision.getId(), 1L, testUser);

		List<ExerciseProject> exerciseProjects = ExerciseEndpointTestHelper.getExerciseProjectsByExerciseID(1L, testUser);

		assertEquals(2, exerciseProjects.size());
	}

	/**
	 * Tests if a registered user can create an exercise project
	 * @throws UnauthorizedException
	 */
	@Test
	public void createExerciseProjectTest() throws UnauthorizedException {
		ProjectEndpoint pe = new ProjectEndpoint();

		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CodeSystemTestHelper.addCodeSystem(2L, testUser);
		ProjectEndpointTestHelper.addProject(1L, "A name", "A description", 2L, testUser);
		ProjectRevision revision = pe.createSnapshot(1L, "A test revision", testUser);
		CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", testUser);
		ExerciseEndpointTestHelper.createExerciseProject(revision.getId(), 1L, testUser);
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("ExerciseProject")).countEntities(withLimit(10)));
	}

	/**
	 * Tests if a registered user can create an exercise project
	 * @throws UnauthorizedException
	 */
	@Test
	public void createExerciseProjectIfNeededTest() throws UnauthorizedException {
		ProjectEndpoint pe = new ProjectEndpoint();

		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CodeSystemTestHelper.addCodeSystem(2L, testUser);
		ProjectEndpointTestHelper.addProject(1L, "A name", "A description", 2L, testUser);
		ProjectRevision revision = pe.createSnapshot(1L, "A test revision", testUser);
		CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", testUser);
		ExerciseEndpointTestHelper.createExerciseProjectIfNeeded(revision.getId(), 1L, testUser);
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("ExerciseProject")).countEntities(withLimit(10)));

		ExerciseEndpointTestHelper.createExerciseProjectIfNeeded(revision.getId(), 1L, testUser);
		assertEquals(1, ds.prepare(new Query("ExerciseProject")).countEntities(withLimit(10)));
	}

}
