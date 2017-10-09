package com.qdacity.test.ProjectStatsEndpoint;

import static org.junit.Assert.assertEquals;

import javax.jdo.PersistenceManager;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.PMF;
import com.qdacity.endpoint.ProjectStatsEndpoint;
import com.qdacity.project.metrics.ProjectStats;
import com.qdacity.test.CodeEndpoint.CodeEndpointTestHelper;
import com.qdacity.test.ProjectEndpoint.ProjectEndpointTestHelper;
import com.qdacity.test.TextDocumentEndpointTest.TextDocumentEndpointTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;

public class ProjectStatsEndpointTest {
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
	public void testGetProjectStats() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "Owner", "Guy", testUser);
		ProjectEndpointTestHelper.setupProjectWithCodesystem(1L, "My Project", "I'm testing this to evaluate a revision", testUser);
		ProjectStatsEndpoint pse = new ProjectStatsEndpoint();
		
		CodeEndpointTestHelper.addCode(33L, 3L, 1L, 15648758L, "authorName", "fff", testUser);
		CodeEndpointTestHelper.addCode(44L, 4L, 1L, 15648758L, "authorName", "fff", testUser);

		TextDocumentEndpointTestHelper.addTextDocument(1L, "First document text. </br> <coding id=\"337\" code_id=\"28\" author=\"Author Name\" codename=\"a code\" title=\"a code\" data-toggle=\"tooltip\" data-placement=\"bottom\">some text</coding>", "First Title", testUser);

		ProjectStats projectStats = pse.getProjectStats(1L, "PROJECT", testUser);
		
		
		assertEquals(3L, projectStats.getCodeCount());
		assertEquals(1L, projectStats.getCodingCount());
	}


	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}