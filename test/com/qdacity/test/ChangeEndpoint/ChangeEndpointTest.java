package com.qdacity.test.ChangeEndpoint;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.endpoint.ChangeEndpoint;
import com.qdacity.logs.Change;
import com.qdacity.logs.ChangeObject;
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
		latch.reset(4);
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
		changes.sort(new Comparator<Change>() {
			@Override
			public int compare(Change a, Change b) {
				if (a.getDatetime().before(b.getDatetime())) return 1;
				return -1;
			}
		});
		Change change = changes.get(2);
		assertEquals(1L, change.getProjectID(), 0);
		assertEquals(null, change.getAttributeType());
		assertEquals(ChangeType.CREATED, change.getChangeType());
		assertEquals(ChangeObject.CODE, change.getObjectType());
		assertEquals(ProjectType.PROJECT, change.getProjectType());
		assertEquals(testUser.getUserId(), change.getUserID());
		assertEquals(33L, change.getObjectID(), 0);
		assertEquals(null, change.getOldValue());

		assertTrue(change.getNewValue().startsWith("{\"codeId\":\"3\"},{\"color\":\"fff\"},{\"author\":\"authorName\"}"));

	}
}
