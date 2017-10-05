package com.qdacity.test.ValidationEndpoint;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

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
import com.qdacity.project.metrics.EvaluationMethod;
import com.qdacity.project.metrics.EvaluationUnit;
import com.qdacity.project.metrics.ValidationReport;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;

public class ValidationEndpointTest {
	private final LocalTaskQueueTestConfig.TaskCountDownLatch latch = new LocalTaskQueueTestConfig.TaskCountDownLatch(5);

	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(false).setCallbackClass(LocalTaskQueueTestConfig.DeferredTaskCallback.class).setTaskExecutionLatch(latch));
	private final com.google.appengine.api.users.User testUser = new com.google.appengine.api.users.User("asd@asd.de", "bla", "123456");
	@Before
	public void setUp() {
		helper.setUp();
	}

	@After
	public void tearDown() {
		helper.tearDown();
	}
	
	@Rule
	public ExpectedException expectedException = ExpectedException.none();

	@Test
	public void testEvaluateRevision() throws UnauthorizedException {

		com.google.appengine.api.users.User student = new com.google.appengine.api.users.User("student@asd.de", "bla", "77777");
		UserEndpointTestHelper.addUser("student@asd.de", "Student", "B", student);
		UserEndpointTestHelper.addUser("asd@asd.de", "Owner", "Guy", testUser);

		ValidationProject valPrj = ValidationEndpointTestHelper.setUpValidationProject(testUser, student);
		
		ValidationEndpoint ve = new ValidationEndpoint();
		ve.evaluateRevision(valPrj.getRevisionID(), "ReportTest", "1", EvaluationMethod.F_MEASURE.toString(), EvaluationUnit.PARAGRAPH.toString(), null, testUser);

		LocalTaskQueue ltq = LocalTaskQueueTestConfig.getLocalTaskQueue();
		QueueStateInfo qsi = ltq.getQueueStateInfo().get(QueueFactory.getDefaultQueue().getQueueName());
		assertEquals(1, qsi.getTaskInfo().size());

		try {
			latch.await(20, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
			fail("Deferred task did not finish in time");
		}

		ltq = LocalTaskQueueTestConfig.getLocalTaskQueue();
		qsi = ltq.getQueueStateInfo().get(QueueFactory.getDefaultQueue().getQueueName());
		assertEquals(0, qsi.getTaskInfo().size());

		List<ValidationReport> reports = ve.listReports(1L, testUser);
		assertEquals(1, reports.size());
	}


	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}