package com.qdacity.test.ExerciseEndpoint;

import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.junit.Assert.assertEquals;

import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.exercise.Exercise;
import com.qdacity.test.CourseEndpoint.CourseEndpointTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;

public class ExerciseEndpointTest {

	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml"));
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
	 * Tests if a registered user can create an exercise
	 */
	@Test
	public void testExerciseInsert() {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", testUser);

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("Exercise")).countEntities(withLimit(10)));
	}
	

	/**
	 * Tests if a user can delete his own exercise
	 */
	@Test
	public void testExerciseRemove() {
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
	 */
	@Test
	public void testListExercise() {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", testUser);
		
		List<Exercise> retrievedExercises = null;

		retrievedExercises = (List<Exercise>) ExerciseEndpointTestHelper.listExercises(1L, testUser);
		
		assertEquals(1, retrievedExercises.size());
	}
	
}