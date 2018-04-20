package com.qdacity.test.ExerciseEndpoint;

import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.dev.LocalTaskQueue;
import com.google.appengine.api.taskqueue.dev.QueueStateInfo;
import com.qdacity.course.TermCourse;
import com.qdacity.endpoint.CourseEndpoint;
import com.qdacity.endpoint.ExerciseEndpoint;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.exercise.ExerciseGroup;
import com.qdacity.project.ProjectType;
import com.qdacity.project.data.AgreementMap;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.*;
import com.qdacity.test.TextDocumentEndpointTest.TextDocumentEndpointTestHelper;
import com.qdacity.user.User;
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
	    Date nextYear = new Date();
	    nextYear.setTime(31556952000L + nextYear.getTime());
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", nextYear, testUser);

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("Exercise")).countEntities(withLimit(10)));
	}



	/**
	 * Tests if a user can delete his own exercise
	 * @throws UnauthorizedException
	 */
	@Test
	public void testExerciseRemove() throws UnauthorizedException {
        Date nextYear = new Date();
        nextYear.setTime(31556952000L + nextYear.getTime());

		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		CourseEndpointTestHelper.addCourse(1L, "New Course", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		ExerciseEndpointTestHelper.addExercise(1L, 1L, "ex 1", nextYear, testUser);

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
        Date nextYear = new Date();
        nextYear.setTime(31556952000L + nextYear.getTime());

		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", nextYear, testUser);

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
        Date nextYear = new Date();
        nextYear.setTime(31556952000L + nextYear.getTime());

		ProjectEndpoint pe = new ProjectEndpoint();

		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CodeSystemTestHelper.addCodeSystem(2L, testUser);
		ProjectEndpointTestHelper.addProject(1L, "A name", "A description", 2L, testUser);
		ProjectRevision revision = pe.createSnapshot(1L, "A test revision", testUser);
		CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", nextYear, testUser);
		ExerciseEndpointTestHelper.createExerciseProject(revision.getId(), 1L, testUser);
		ExerciseProject exerciseProject = ExerciseEndpointTestHelper.getExerciseProjectByRevisionID(revision.getId(), testUser);

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query("ExerciseProject");
		Entity queryResult = ds.prepare(q).asSingleEntity();

		assertEquals(Long.valueOf(queryResult.getKey().getId()), exerciseProject.getId());
	}

    /**
     * Tests if a registered user can get an exercise by id
     * @throws UnauthorizedException
     */
    @Test
    public void getExerciseByIDTest() throws UnauthorizedException {
        Date nextYear = new Date();
        nextYear.setTime(31556952000L + nextYear.getTime());

        ProjectEndpoint pe = new ProjectEndpoint();
        ExerciseEndpoint ee = new ExerciseEndpoint();
        UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
        CodeSystemTestHelper.addCodeSystem(2L, testUser);
        ProjectEndpointTestHelper.addProject(1L, "A name", "A description", 2L, testUser);
        ProjectRevision revision = pe.createSnapshot(1L, "A test revision", testUser);
        CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);
        CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
        ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", nextYear, testUser);
        Exercise exercise = ee.getExerciseByID(1L, testUser);

        assertEquals(1L, exercise.getId().longValue());
    }

	/**
	 * Tests if a registered user can get an exerciseProject by its revision id
	 * @throws UnauthorizedException
	 */
	@Test
	public void getExerciseProjectsByExerciseIDTest() throws UnauthorizedException {
        Date nextYear = new Date();
        nextYear.setTime(31556952000L + nextYear.getTime());

		ProjectEndpoint pe = new ProjectEndpoint();

		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CodeSystemTestHelper.addCodeSystem(2L, testUser);
		ProjectEndpointTestHelper.addProject(1L, "A name", "A description", 2L, testUser);
		ProjectRevision revision = pe.createSnapshot(1L, "A test revision", testUser);
		CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", nextYear, testUser);
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
        Date nextYear = new Date();
        nextYear.setTime(31556952000L + nextYear.getTime());

		ProjectEndpoint pe = new ProjectEndpoint();

		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CodeSystemTestHelper.addCodeSystem(2L, testUser);
		ProjectEndpointTestHelper.addProject(1L, "A name", "A description", 2L, testUser);
		ProjectRevision revision = pe.createSnapshot(1L, "A test revision", testUser);
		CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", nextYear, testUser);
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
        Date nextYear = new Date();
        nextYear.setTime(31556952000L + nextYear.getTime());

		ProjectEndpoint pe = new ProjectEndpoint();

		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CodeSystemTestHelper.addCodeSystem(2L, testUser);
		ProjectEndpointTestHelper.addProject(1L, "A name", "A description", 2L, testUser);
		ProjectRevision revision = pe.createSnapshot(1L, "A test revision", testUser);
		CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);
		CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
		ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", nextYear, testUser);
		ExerciseEndpointTestHelper.createExerciseProjectIfNeeded(revision.getId(), 1L, testUser);
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		assertEquals(1, ds.prepare(new Query("ExerciseProject")).countEntities(withLimit(10)));

		ExerciseEndpointTestHelper.createExerciseProjectIfNeeded(revision.getId(), 1L, testUser);
		assertEquals(1, ds.prepare(new Query("ExerciseProject")).countEntities(withLimit(10)));
	}

    @Test
    public void testEvaluateRevisionFMeasure() throws UnauthorizedException {
        Date nextYear = new Date();
        nextYear.setTime(31556952000L + nextYear.getTime());

        latch.reset(12);
        com.google.api.server.spi.auth.common.User studentA = new AuthenticatedUser("77777", "student@group.riehle.org", LoginProviderType.GOOGLE);
        User addedStudentA = UserEndpointTestHelper.addUser("testdummy.smash@gmail.com", "Student", "B", studentA);
        com.google.api.server.spi.auth.common.User studentB = new AuthenticatedUser("88888", "student@group.riehle.org", LoginProviderType.GOOGLE);
        User addedStudentB = UserEndpointTestHelper.addUser("testdummy.smash@gmail.com", "Student", "B", studentB);

        UserEndpointTestHelper.addUser("testdummy.smash@gmail.com", "Owner", "Guy", testUser);

        CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);

        CourseEndpoint courseEndpoint = new CourseEndpoint();
        TermCourse termCourse = new TermCourse();
        termCourse.setId(1L);
        termCourse.setCourseID(1L);
        List<String> owners = new ArrayList<>();
        owners.add(addedStudentA.getId().toString());
        owners.add(addedStudentB.getId().toString());
        termCourse.setOwners(owners);
        courseEndpoint.insertTermCourse(termCourse, testUser);
        ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", nextYear, testUser);

        ExerciseProject exPrj = ExerciseEndpointTestHelper.setUpExerciseProject(testUser, studentA, studentB, 1L, 1L, 1L);

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

    @Test
    public void testCheckAndCreateExerciseProjectSnapshotsIfNeeded() throws UnauthorizedException {
        Date passedDeadline = new Date();
        passedDeadline.setTime(passedDeadline.getTime() - 31556952000L);
        Date nextYear = new Date();
        nextYear.setTime(31556952000L + nextYear.getTime());

        com.google.api.server.spi.auth.common.User studentA = new AuthenticatedUser("77777", "student@group.riehle.org", LoginProviderType.GOOGLE);
        User addedStudentA = UserEndpointTestHelper.addUser("testdummy.smash@gmail.com", "Student", "B", studentA);
        com.google.api.server.spi.auth.common.User studentB = new AuthenticatedUser("88888", "student@group.riehle.org", LoginProviderType.GOOGLE);
        User addedStudentB = UserEndpointTestHelper.addUser("testdummy.smash@gmail.com", "Student", "B", studentB);

        UserEndpointTestHelper.addUser("testdummy.smash@gmail.com", "Owner", "Guy", testUser);

        CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);

        CourseEndpoint courseEndpoint = new CourseEndpoint();
        TermCourse termCourse = new TermCourse();
        termCourse.setId(1L);
        termCourse.setCourseID(1L);
        List<String> owners = new ArrayList<>();
        owners.add(addedStudentA.getId().toString());
        owners.add(addedStudentB.getId().toString());
        termCourse.setOwners(owners);
        courseEndpoint.insertTermCourse(termCourse, testUser);
        ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", passedDeadline, testUser);
        ExerciseEndpointTestHelper.addExercise(2L, 1L, "New Exercise 2", nextYear, testUser);
        //Creates an exerciseProject for each student
        ExerciseEndpointTestHelper.setUpExerciseProject(testUser, studentA, studentB, 1L, 1L, 1L);

        //Create an exerciseProject for each student for exercise 2 (whose deadline has passed)
        ExerciseEndpoint ee = new ExerciseEndpoint();
        List<ProjectRevision> revisions;
        ProjectEndpoint pe = new ProjectEndpoint();
        revisions = pe.listRevisions(1L, testUser);
        Long revID = revisions.get(0).getId();
        ee.createExerciseProject(revID, 2L, studentA);
        ee.createExerciseProject(revID, 2L, studentB);

        //Running this more than once should not clone the exerciseProjects more than once
        ee.checkAndCreateExerciseProjectSnapshotsIfNeeded(studentA);
        ee.checkAndCreateExerciseProjectSnapshotsIfNeeded(studentA);

        List<ExerciseProject> exerciseProjects = ee.getExerciseProjectsByExerciseID(1L, studentA);
        List<ExerciseProject> exerciseProjects2 = ee.getExerciseProjectsByExerciseID(2L, studentA);

        //Only exerciseProjects related to exercise 1 should be cloned and only once, because exercise 2 still hasn't met the deadline
        //That means a total of 6 exercise projects should exist in the datastore
        assertEquals(6, exerciseProjects.size() + exerciseProjects2.size());
   }

    /**
     * Tests if a registered user can get exercises of an exerciseGroup
     * @throws UnauthorizedException
     */
    @Test
    public void getExercisesOfExerciseGroupTest() throws UnauthorizedException {


        Date nextYear = new Date();
        nextYear.setTime(31556952000L + nextYear.getTime());

        ProjectEndpoint pe = new ProjectEndpoint();

        UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
        CodeSystemTestHelper.addCodeSystem(2L, testUser);
        ProjectEndpointTestHelper.addProject(1L, "A name", "A description", 2L, testUser);
        ProjectRevision revision = pe.createSnapshot(1L, "A test revision", testUser);
        CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);
        CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
        ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", nextYear, testUser);
        ExerciseEndpointTestHelper.addExercise(2L, 1L, "New Exercise 2", nextYear, testUser);
        ExerciseEndpointTestHelper.addExercise(3L, 1L, "New Exercise 3", nextYear, testUser);
        ExerciseEndpointTestHelper.addExerciseGroup(1L, revision.getRevisionID(), 1L, "exercise Group 1", Arrays.asList("1", "2", "3"), 1L, testUser);
        ExerciseEndpoint ee = new ExerciseEndpoint();

        List<Exercise> exercises = ee.getExercisesOfExerciseGroup(1L, testUser);
        assertEquals(3, exercises.size());
    }

    /**
     * Tests if a registered user can create an exerciseGroup
     * @throws UnauthorizedException
     */
    @Test
    public void insertExerciseGroupTest() throws UnauthorizedException {

        Date nextYear = new Date();
        nextYear.setTime(31556952000L + nextYear.getTime());

        ProjectEndpoint pe = new ProjectEndpoint();

        UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
        CodeSystemTestHelper.addCodeSystem(2L, testUser);
        ProjectEndpointTestHelper.addProject(1L, "A name", "A description", 2L, testUser);
        ProjectRevision revision = pe.createSnapshot(1L, "A test revision", testUser);
        CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);
        CourseEndpointTestHelper.addTermCourse(1L, 1L, "A description", testUser);
        ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", nextYear, testUser);
        ExerciseEndpointTestHelper.addExercise(2L, 1L, "New Exercise 2", nextYear, testUser);
        ExerciseEndpointTestHelper.addExercise(3L, 1L, "New Exercise 3", nextYear, testUser);
        ExerciseEndpointTestHelper.addExerciseGroup(1L, revision.getRevisionID(), 1L, "exercise Group 1", Arrays.asList("1", "2", "3"), 1L, testUser);
        ExerciseEndpoint ee = new ExerciseEndpoint();

        List<ExerciseGroup> exerciseGroups = ee.getExerciseGroupsByProjectRevisionID(revision.getRevisionID(), testUser);
        assertEquals(1, exerciseGroups.size());
    }

    /**
     * Tests if a registered user can delete an exerciserProject report
     * @throws UnauthorizedException
     */
    @Test
    public void deleteExerciseProjectReportTest() throws UnauthorizedException {
        Date nextYear = new Date();
        nextYear.setTime(31556952000L + nextYear.getTime());

        latch.reset(12);
        com.google.api.server.spi.auth.common.User studentA = new AuthenticatedUser("77777", "student@group.riehle.org", LoginProviderType.GOOGLE);
        User addedStudentA = UserEndpointTestHelper.addUser("testdummy.smash@gmail.com", "Student", "B", studentA);
        com.google.api.server.spi.auth.common.User studentB = new AuthenticatedUser("88888", "student@group.riehle.org", LoginProviderType.GOOGLE);
        User addedStudentB = UserEndpointTestHelper.addUser("testdummy.smash@gmail.com", "Student", "B", studentB);

        UserEndpointTestHelper.addUser("testdummy.smash@gmail.com", "Owner", "Guy", testUser);

        CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);

        CourseEndpoint courseEndpoint = new CourseEndpoint();
        TermCourse termCourse = new TermCourse();
        termCourse.setId(1L);
        termCourse.setCourseID(1L);
        List<String> owners = new ArrayList<>();
        owners.add(addedStudentA.getId().toString());
        owners.add(addedStudentB.getId().toString());
        termCourse.setOwners(owners);
        courseEndpoint.insertTermCourse(termCourse, testUser);
        ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", nextYear, testUser);

        ExerciseProject exPrj = ExerciseEndpointTestHelper.setUpExerciseProject(testUser, studentA, studentB, 1L, 1L, 1L);

        String docsToEvaluate = getDocumentsAsCSV(exPrj.getRevisionID(), ProjectType.EXERCISE);
        ExerciseEndpoint ee = new ExerciseEndpoint();
        ee.evaluateExerciseRevision(1L, exPrj.getRevisionID(), "ReportTest", docsToEvaluate,EvaluationMethod.F_MEASURE.toString(), EvaluationUnit.PARAGRAPH.toString(), null, testUser);

        try {
            latch.await(25, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            e.printStackTrace();
            fail("Deferred task did not finish in time");
        }

        DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
        Query q = new Query("ExerciseReport");
        Entity queryResult = ds.prepare(q).asSingleEntity();
        assertEquals(1, ds.prepare(q).countEntities(withLimit(10)));
        ee.deleteExerciseProjectReport(queryResult.getKey().getId(), testUser);

        assertEquals(0, ds.prepare(new Query("ExerciseReport")).countEntities(withLimit(10)));
    }


    @Test
    public void listExerciseReportsByRevisionIDTest() throws UnauthorizedException {
        Date nextYear = new Date();
        nextYear.setTime(31556952000L + nextYear.getTime());

        latch.reset(12);
        com.google.api.server.spi.auth.common.User studentA = new AuthenticatedUser("77777", "student@group.riehle.org", LoginProviderType.GOOGLE);
        User addedStudentA = UserEndpointTestHelper.addUser("testdummy.smash@gmail.com", "Student", "B", studentA);
        com.google.api.server.spi.auth.common.User studentB = new AuthenticatedUser("88888", "student@group.riehle.org", LoginProviderType.GOOGLE);
        User addedStudentB = UserEndpointTestHelper.addUser("testdummy.smash@gmail.com", "Student", "B", studentB);

        UserEndpointTestHelper.addUser("testdummy.smash@gmail.com", "Owner", "Guy", testUser);

        CourseEndpointTestHelper.addCourse(1L, "A name", "A description", testUser);

        CourseEndpoint courseEndpoint = new CourseEndpoint();
        TermCourse termCourse = new TermCourse();
        termCourse.setId(1L);
        termCourse.setCourseID(1L);
        List<String> owners = new ArrayList<>();
        owners.add(addedStudentA.getId().toString());
        owners.add(addedStudentB.getId().toString());
        termCourse.setOwners(owners);
        courseEndpoint.insertTermCourse(termCourse, testUser);
        ExerciseEndpointTestHelper.addExercise(1L, 1L, "New Exercise", nextYear, testUser);

        ExerciseProject exPrj = ExerciseEndpointTestHelper.setUpExerciseProject(testUser, studentA, studentB, 1L, 1L, 1L);

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


        List<ExerciseReport> reports = ee.listExerciseReportsByRevisionID(exPrj.getRevisionID(), 1L, testUser);
        assertEquals(1, reports.size());


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
