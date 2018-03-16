package com.qdacity.test.ExerciseEndpoint;

import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.TimeUnit;

import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.dev.LocalTaskQueue;
import com.google.appengine.api.taskqueue.dev.QueueStateInfo;
import com.qdacity.course.TermCourse;
import com.qdacity.endpoint.CourseEndpoint;
import com.qdacity.endpoint.ExerciseEndpoint;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.project.ProjectType;
import com.qdacity.project.data.AgreementMap;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.*;
import com.qdacity.test.TextDocumentEndpointTest.TextDocumentEndpointTestHelper;
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
    private final LocalTaskQueueTestConfig.TaskCountDownLatch latch = new LocalTaskQueueTestConfig.TaskCountDownLatch(1);
    private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(false).setCallbackClass(LocalTaskQueueTestConfig.DeferredTaskCallback.class).setTaskExecutionLatch(latch));

    //private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml"));
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

    @Test
    public void testEvaluateRevisionFMeasure() throws UnauthorizedException {
        latch.reset(12);
        com.google.api.server.spi.auth.common.User studentA = new AuthenticatedUser("77777", "student@group.riehle.org", LoginProviderType.GOOGLE);
        UserEndpointTestHelper.addUser("testdummy.smash@gmail.com", "Student", "B", studentA);
        com.google.api.server.spi.auth.common.User studentB = new AuthenticatedUser("88888", "student@group.riehle.org", LoginProviderType.GOOGLE);
        UserEndpointTestHelper.addUser("testdummy.smash@gmail.com", "Student", "B", studentB);

        UserEndpointTestHelper.addUser("testdummy.smash@gmail.com", "Owner", "Guy", testUser);

        CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);

        CourseEndpoint courseEndpoint = new CourseEndpoint();
        TermCourse termCourse = new TermCourse();
        termCourse.setId(1L);
        termCourse.setCourseID(1L);
        List<String> owners = new ArrayList<>();
        owners.add(studentA.getId().toString());
        owners.add(studentB.getId().toString());
        termCourse.setOwners(owners);
        courseEndpoint.insertTermCourse(termCourse, testUser);
        ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", testUser);

        ExerciseProject exPrj = ExerciseEndpointTestHelper.setUpExerciseProject(testUser, studentA, studentB);

        String docsToEvaluate = getDocumentsAsCSV(exPrj.getRevisionID(), ProjectType.EXERCISE);
        ExerciseEndpoint ee = new ExerciseEndpoint();
        ee.evaluateExerciseRevision(1L, exPrj.getRevisionID(), "ReportTest", docsToEvaluate,EvaluationMethod.F_MEASURE.toString(), EvaluationUnit.PARAGRAPH.toString(), null, testUser);

        try {
            latch.await(25, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            e.printStackTrace();
            fail("Deferred task did not finish in time");
        }

        LocalTaskQueue ltq = LocalTaskQueueTestConfig.getLocalTaskQueue();
        QueueStateInfo qsi = ltq.getQueueStateInfo().get(QueueFactory.getDefaultQueue().getQueueName());
        assertEquals(0, qsi.getTaskInfo().size());

        List<ExerciseReport> reports = ee.listExerciseReports(1L, 1L, testUser);
        assertEquals(1, reports.size());
        ExerciseReport report = reports.get(0);
        assertEquals(1L, report.getProjectID(), 0);
        assertEquals(exPrj.getRevisionID(), report.getRevisionID(), 0);
        assertEquals(EvaluationUnit.PARAGRAPH.toString(), report.getEvaluationUnit());
        assertEquals(EvaluationMethod.F_MEASURE.toString(), report.getEvaluationMethod());
        assertEquals("ReportTest", report.getName());

        List<DocumentResult> docResults = report.getDocumentResults();
        assertEquals(1, docResults.size());
        TextDocumentEndpoint tde = new TextDocumentEndpoint();
        List<AgreementMap> agreementMaps = tde.getAgreementMaps(report.getId(), "EXERCISE", testUser);
        assertEquals(1, agreementMaps.size());
        latch.reset(1);

        try {
            latch.await(20, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            e.printStackTrace();
            fail("Deferred task did not finish in time");
        }

    }
    private String getDocumentsAsCSV(long projectID, ProjectType projectType) {
        Collection<TextDocument> docs = TextDocumentEndpointTestHelper.getTextDocuments(projectID, projectType, testUser);
        String documentsToEvaluate = "";
        for (TextDocument textDocument : docs) {
            documentsToEvaluate += textDocument.getId() + ",";
        }
        return documentsToEvaluate;

    }

}
