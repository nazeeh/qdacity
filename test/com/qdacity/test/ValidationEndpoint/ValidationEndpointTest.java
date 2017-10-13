package com.qdacity.test.ValidationEndpoint;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.Collection;
import java.util.List;
import java.util.concurrent.TimeUnit;

import javax.jdo.PersistenceManager;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.dev.LocalTaskQueue;
import com.google.appengine.api.taskqueue.dev.QueueStateInfo;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.PMF;
import com.qdacity.endpoint.ValidationEndpoint;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.EvaluationMethod;
import com.qdacity.project.metrics.EvaluationUnit;
import com.qdacity.project.metrics.ValidationReport;
import com.qdacity.test.TextDocumentEndpointTest.TextDocumentEndpointTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;

public class ValidationEndpointTest {
	private final LocalTaskQueueTestConfig.TaskCountDownLatch latch = new LocalTaskQueueTestConfig.TaskCountDownLatch(1);

	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(false).setCallbackClass(LocalTaskQueueTestConfig.DeferredTaskCallback.class).setTaskExecutionLatch(latch));
	private final com.google.appengine.api.users.User testUser = new com.google.appengine.api.users.User("asd@asd.de", "bla", "123456");
	@Before
	public void setUp() {
		helper.setUp();
	}

	@After
	public void tearDown() {
		latch.reset();
		helper.tearDown();
	}
	
	@Rule
	public ExpectedException expectedException = ExpectedException.none();

	@Test
	public void testEvaluateRevisionFMeasure() throws UnauthorizedException {
		latch.reset(9);
		com.google.appengine.api.users.User studentA = new com.google.appengine.api.users.User("student@asd.de", "bla", "77777");
		UserEndpointTestHelper.addUser("student@asd.de", "Student", "B", studentA);
		com.google.appengine.api.users.User studentB = new com.google.appengine.api.users.User("student@asd.de", "bla", "88888");
		UserEndpointTestHelper.addUser("student@asd.de", "Student", "B", studentB);

		UserEndpointTestHelper.addUser("asd@asd.de", "Owner", "Guy", testUser);

		ValidationProject valPrj = ValidationEndpointTestHelper.setUpValidationProject(testUser, studentA, studentB);
		String docsToEvaluate = getDocumentsAsCSV(valPrj.getRevisionID(), "REVISION");
		ValidationEndpoint ve = new ValidationEndpoint();
		ve.evaluateRevision(valPrj.getRevisionID(), "ReportTest", docsToEvaluate, EvaluationMethod.F_MEASURE.toString(), EvaluationUnit.PARAGRAPH.toString(), null, testUser);

		try {
			latch.await(25, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
			fail("Deferred task did not finish in time");
		}

		LocalTaskQueue ltq = LocalTaskQueueTestConfig.getLocalTaskQueue();
		QueueStateInfo qsi = ltq.getQueueStateInfo().get(QueueFactory.getDefaultQueue().getQueueName());
		assertEquals(0, qsi.getTaskInfo().size());

		List<ValidationReport> reports = ve.listReports(1L, testUser);
		assertEquals(1, reports.size());
	}

	@Test
	public void testEvaluateRevisionAlpha() throws UnauthorizedException {
		latch.reset(9);
		com.google.appengine.api.users.User studentA = new com.google.appengine.api.users.User("student@asd.de", "bla", "77777");
		UserEndpointTestHelper.addUser("student@asd.de", "Student", "B", studentA);

		com.google.appengine.api.users.User studentB = new com.google.appengine.api.users.User("student@asd.de", "bla", "88888");
		UserEndpointTestHelper.addUser("student@asd.de", "Student", "B", studentB);

		UserEndpointTestHelper.addUser("asd@asd.de", "Owner", "Guy", testUser);

		ValidationProject valPrj = ValidationEndpointTestHelper.setUpValidationProject(testUser, studentA, studentB);
		Collection<TextDocument> docs = TextDocumentEndpointTestHelper.getTextDocuments(1L, "PROJECT", testUser);
		String docsToEvaluate = getDocumentsAsCSV(valPrj.getRevisionID(), "REVISION");
		ValidationEndpoint ve = new ValidationEndpoint();
		ve.evaluateRevision(valPrj.getRevisionID(), "ReportTest", docsToEvaluate, EvaluationMethod.KRIPPENDORFFS_ALPHA.toString(), EvaluationUnit.PARAGRAPH.toString(), null, testUser);

		try {
			latch.await(20, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
			fail("Deferred task did not finish in time");
		}

		LocalTaskQueue ltq = LocalTaskQueueTestConfig.getLocalTaskQueue();
		QueueStateInfo qsi = ltq.getQueueStateInfo().get(QueueFactory.getDefaultQueue().getQueueName());
		assertEquals(0, qsi.getTaskInfo().size());

		List<ValidationReport> reports = ve.listReports(1L, testUser);
		assertEquals(1, reports.size());
	}

	private String getDocumentsAsCSV(long projectID, String projectType) {
		Collection<TextDocument> docs = TextDocumentEndpointTestHelper.getTextDocuments(projectID, projectType, testUser);
		String documentsToEvaluate = "";
		for (TextDocument textDocument : docs) {
			documentsToEvaluate += textDocument.getId() + ",";
		}
		return documentsToEvaluate;

	}


	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}