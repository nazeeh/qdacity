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
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.endpoint.ValidationEndpoint;
import com.qdacity.project.ProjectType;
import com.qdacity.project.ValidationProject;
import com.qdacity.project.data.AgreementMap;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.DocumentResult;
import com.qdacity.project.metrics.EvaluationMethod;
import com.qdacity.project.metrics.EvaluationUnit;
import com.qdacity.project.metrics.ValidationReport;
import com.qdacity.test.TextDocumentEndpointTest.TextDocumentEndpointTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;
import com.qdacity.user.LoginProviderType;

public class ValidationEndpointTest {
	private final LocalTaskQueueTestConfig.TaskCountDownLatch latch = new LocalTaskQueueTestConfig.TaskCountDownLatch(1);

	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(false).setCallbackClass(LocalTaskQueueTestConfig.DeferredTaskCallback.class).setTaskExecutionLatch(latch));
	private final com.google.api.server.spi.auth.common.User testUser = new AuthenticatedUser("123456", "asd@asd.de", LoginProviderType.GOOGLE);
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
		latch.reset(10);
		com.google.api.server.spi.auth.common.User studentA = new AuthenticatedUser("77777", "student@group.riehle.org", LoginProviderType.GOOGLE);
		UserEndpointTestHelper.addUser("testdummy.smash@gmail.com", "Student", "B", studentA);
		com.google.api.server.spi.auth.common.User studentB = new AuthenticatedUser("88888", "student@group.riehle.org", LoginProviderType.GOOGLE);
		UserEndpointTestHelper.addUser("testdummy.smash@gmail.com", "Student", "B", studentB);

		UserEndpointTestHelper.addUser("testdummy.smash@gmail.com", "Owner", "Guy", testUser);

		ValidationProject valPrj = ValidationEndpointTestHelper.setUpValidationProject(testUser, studentA, studentB);
		String docsToEvaluate = getDocumentsAsCSV(valPrj.getRevisionID(), ProjectType.REVISION);
		ValidationEndpoint ve = new ValidationEndpoint();
		ve.evaluateRevision(valPrj.getRevisionID(), "ReportTest", docsToEvaluate, EvaluationMethod.F_MEASURE.toString(), EvaluationUnit.PARAGRAPH.toString(), null, testUser);

		LocalTaskQueue ltq = LocalTaskQueueTestConfig.getLocalTaskQueue();

		try {
			latch.await(30, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
			fail("Deferred task did not finish in time");
		}

		QueueStateInfo qsi = ltq.getQueueStateInfo().get(QueueFactory.getDefaultQueue().getQueueName());
		assertEquals(0, qsi.getTaskInfo().size());

		List<ValidationReport> reports = ve.listReports(1L, testUser);
		assertEquals(1, reports.size());
		ValidationReport report = reports.get(0);
		assertEquals(1L, report.getProjectID(), 0);
		assertEquals(valPrj.getRevisionID(), report.getRevisionID(), 0);
		assertEquals(EvaluationUnit.PARAGRAPH.toString(), report.getEvaluationUnit());
		assertEquals(EvaluationMethod.F_MEASURE.toString(), report.getEvaluationMethod());
		assertEquals("ReportTest", report.getName());
		
		List<DocumentResult> docResults = report.getDocumentResults();
		assertEquals(1, docResults.size());
		TextDocumentEndpoint tde = new TextDocumentEndpoint();
		List<AgreementMap> agreementMaps = tde.getAgreementMaps(report.getId(), "REVISION", testUser);
		assertEquals(1, agreementMaps.size());
		latch.reset(1);
		ve.sendNotificationEmail(report.getId(), testUser);

		try {
			latch.await(20, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
			fail("Deferred task did not finish in time");
		}

	}

	@Test
	public void testEvaluateRevisionAlpha() throws UnauthorizedException {
		latch.reset(7);
		com.google.api.server.spi.auth.common.User studentA = new AuthenticatedUser("77777", "student@asd.de", LoginProviderType.GOOGLE);
		UserEndpointTestHelper.addUser("student@asd.de", "Student", "B", studentA);

		com.google.api.server.spi.auth.common.User studentB = new AuthenticatedUser("88888", "student@asd.de", LoginProviderType.GOOGLE);
		UserEndpointTestHelper.addUser("student@asd.de", "Student", "B", studentB);

		UserEndpointTestHelper.addUser("asd@asd.de", "Owner", "Guy", testUser);

		ValidationProject valPrj = ValidationEndpointTestHelper.setUpValidationProject(testUser, studentA, studentB);
		String docsToEvaluate = getDocumentsAsCSV(valPrj.getRevisionID(), ProjectType.REVISION);
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
		ValidationReport report = reports.get(0);
		assertEquals(1L, report.getProjectID(), 0);
		assertEquals(valPrj.getRevisionID(), report.getRevisionID(), 0);
		assertEquals(EvaluationUnit.PARAGRAPH.toString(), report.getEvaluationUnit());
		assertEquals(EvaluationMethod.KRIPPENDORFFS_ALPHA.toString(), report.getEvaluationMethod());
		assertEquals("ReportTest", report.getName());


	}

	@Test
	public void testEvaluateRevisionKappa() throws UnauthorizedException {
		latch.reset(7);
		com.google.api.server.spi.auth.common.User studentA = new AuthenticatedUser("77777", "student@asd.de", LoginProviderType.GOOGLE);
		UserEndpointTestHelper.addUser("student@asd.de", "Student", "B", studentA);

		com.google.api.server.spi.auth.common.User studentB = new AuthenticatedUser("88888", "student@asd.de", LoginProviderType.GOOGLE);
		UserEndpointTestHelper.addUser("student@asd.de", "Student", "B", studentB);

		UserEndpointTestHelper.addUser("asd@asd.de", "Owner", "Guy", testUser);

		ValidationProject valPrj = ValidationEndpointTestHelper.setUpValidationProject(testUser, studentA, studentB);
		String docsToEvaluate = getDocumentsAsCSV(valPrj.getRevisionID(), ProjectType.REVISION);
		ValidationEndpoint ve = new ValidationEndpoint();
		ve.evaluateRevision(valPrj.getRevisionID(), "ReportTest", docsToEvaluate, EvaluationMethod.FLEISS_KAPPA.toString(), EvaluationUnit.PARAGRAPH.toString(), null, testUser);

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
		ValidationReport report = reports.get(0);
		assertEquals(1L, report.getProjectID(), 0);
		assertEquals(valPrj.getRevisionID(), report.getRevisionID(), 0);
		assertEquals(EvaluationUnit.PARAGRAPH.toString(), report.getEvaluationUnit());
		assertEquals(EvaluationMethod.FLEISS_KAPPA.toString(), report.getEvaluationMethod());
		assertEquals("ReportTest", report.getName());
	}

	private String getDocumentsAsCSV(long projectID, ProjectType projectType) {
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