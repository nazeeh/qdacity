package com.qdacity.test.ChangeEndpoint;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.endpoint.ChangeEndpoint;
import com.qdacity.logs.Change;
import com.qdacity.logs.ChangeObject;
import com.qdacity.logs.ChangeStats;
import com.qdacity.logs.ChangeType;
import com.qdacity.project.ProjectType;
import com.qdacity.test.CodeEndpoint.CodeEndpointTestHelper;
import com.qdacity.test.ProjectEndpoint.ProjectEndpointTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;

public class ChangeEndpointTest {
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

	/**
	 * Tests if changes are logged when adding and removing codes
	 */
	@Test
	public void testGetAllChanges() {
		latch.reset(5);
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		ProjectEndpointTestHelper.setupProjectWithCodesystem(1L, "My Project", "desc", testUser);
		CodeEndpointTestHelper.addCode(22L, 2L, 1L, 15648758L, "authorName", "fff", testUser);
		CodeEndpointTestHelper.addCode(33L, 3L, 2L, 15648758L, "authorName", "fff", testUser);
		CodeEndpointTestHelper.removeCode(22L, testUser);

		try {
			latch.await(10, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
			fail("Deferred task did not finish in time");
		}

		ChangeEndpoint ce = new ChangeEndpoint();
		List<Change> changes = ce.getAllChanges(1L);
		assertEquals(4, changes.size());

		Collections.sort(changes, new ChangeComparator());
		Change change = changes.get(2);
		assertEquals(1L, change.getProjectID(), 0);
		assertEquals(null, change.getAttributeType());
		assertEquals(ChangeType.CREATED, change.getChangeType());
		assertEquals(ChangeObject.CODE, change.getObjectType());
		assertEquals(ProjectType.PROJECT, change.getProjectType());
		assertEquals(testUser.getUserId(), change.getUserID());
		assertEquals(33L, change.getObjectID(), 0);
		assertEquals(null, change.getOldValue());
		// assertTrue(change.getNewValue().startsWith("{\"codeId\":\"3\"},{\"color\":\"fff\"},{\"author\":\"authorName\"}")); //FIXME check for contains instead. Order may vary.

	}

	/**
	 * Tests if changes are logged when adding and removing codes
	 */
	@Test
	public void testListChangeStats() {
		latch.reset(5);
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		ProjectEndpointTestHelper.setupProjectWithCodesystem(1L, "My Project", "desc", testUser);
		CodeEndpointTestHelper.addCode(22L, 2L, 1L, 15648758L, "authorName", "fff", testUser);
		CodeEndpointTestHelper.addCode(33L, 3L, 2L, 15648758L, "authorName", "fff", testUser);
		CodeEndpointTestHelper.removeCode(22L, testUser);

		try {
			latch.await(10, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
			fail("Deferred task did not finish in time");
		}

		ChangeEndpoint ce = new ChangeEndpoint();
		try {
			List<ChangeStats> stats = ce.listChangeStats(null, "project", 1L, "PROJECT", testUser);
			assertEquals(2, stats.get(0).getCodesCreated());
			assertEquals(2, stats.get(0).getCodesDeleted());
			assertEquals(0, stats.get(0).getCodesModified());
			assertTrue(!stats.get(0).getLabel().isEmpty());
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User was not authorized to list changestats for project 1");
		}


	}

	@Test
	public void testGetChanges() {
		latch.reset(5);
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		ProjectEndpointTestHelper.setupProjectWithCodesystem(1L, "My Project", "desc", testUser);
		CodeEndpointTestHelper.addCode(22L, 2L, 1L, 15648758L, "authorName", "fff", testUser);
		CodeEndpointTestHelper.addCode(33L, 3L, 2L, 15648758L, "authorName", "fff", testUser);
		CodeEndpointTestHelper.removeCode(22L, testUser);

		try {
			latch.await(10, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
			fail("Deferred task did not finish in time");
		}

		ChangeEndpoint ce = new ChangeEndpoint();
		List<Change> allChanges = ce.getChanges(null, null, null, null);
		assertEquals(5, allChanges.size());
		List<Change> createdChanges = ce.getChanges(null, ChangeType.CREATED, null, null);
		assertEquals(3, createdChanges.size());
		List<Change> userChanges = ce.getChanges(ChangeObject.USER, null, null, null);
		assertEquals(1, userChanges.size());
		List<Change> createdCodeChanges = ce.getChanges(ChangeObject.CODE, ChangeType.CREATED, null, null);
		assertEquals(2, createdCodeChanges.size());
	}
}

class ChangeComparator implements Comparator<Change> {
    @Override
	public int compare(Change a, Change b) {
		if (a.getDatetime().before(b.getDatetime())) return 1;
		return -1;
	}
}
