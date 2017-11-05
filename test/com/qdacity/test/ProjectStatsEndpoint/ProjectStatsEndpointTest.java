package com.qdacity.test.ProjectStatsEndpoint;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.Date;

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
import com.qdacity.project.saturation.SaturationResult;
import com.qdacity.test.CodeEndpoint.CodeEndpointTestHelper;
import com.qdacity.test.ProjectEndpoint.ProjectEndpointTestHelper;
import com.qdacity.test.TextDocumentEndpointTest.TextDocumentEndpointTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;

public class ProjectStatsEndpointTest {
	private final LocalTaskQueueTestConfig.TaskCountDownLatch latch = new LocalTaskQueueTestConfig.TaskCountDownLatch(1);

	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(false).setCallbackClass(LocalTaskQueueTestConfig.DeferredTaskCallback.class).setTaskExecutionLatch(latch));
	private final com.google.api.server.spi.auth.common.User testUser = new com.google.api.server.spi.auth.common.User("123456", "asd@asd.de");
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
		assertEquals(1L, projectStats.getDocumentCount());

		SaturationResult satResult = projectStats.getSaturation();
		// assertEquals(1L, satResult.getProjectId(), 0);
		assertTrue(satResult.getCreationTime().before(new Date()));
		assertEquals(0L, satResult.getDeleteCodeRelationShipSaturation(), 0);
		assertEquals(0L, satResult.getDeleteCodeSaturation(), 0);
		assertEquals(0L, satResult.getDocumentSaturation(), 0);
		assertEquals(0L, satResult.getInsertCodeRelationShipSaturation(), 0);
		assertEquals(0L, satResult.getInsertCodeSaturation(), 0);
		assertEquals(0L, satResult.getRelocateCodeSaturation(), 0);
		assertEquals(0L, satResult.getUpdateCodeAuthorSaturation(), 0);
		assertEquals(0L, satResult.getUpdateCodeBookEntryDefinitionSaturation(), 0);
		assertEquals(0L, satResult.getUpdateCodeBookEntryExampleSaturation(), 0);
		assertEquals(0L, satResult.getUpdateCodeBookEntryShortDefinitionSaturation(), 0);
		assertEquals(0L, satResult.getUpdateCodeBookEntryWhenNotToUseSaturation(), 0);
		assertEquals(0L, satResult.getUpdateCodeBookEntryWhenToUseSaturation(), 0);
		assertEquals(0L, satResult.getUpdateCodeColorSaturation(), 0);
		assertEquals(0L, satResult.getUpdateCodeIdSaturation(), 0);
		assertEquals(0L, satResult.getUpdateCodeMemoSaturation(), 0);
		assertEquals(0L, satResult.getUpdateCodeNameSaturation(), 0);
	}
		


	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}