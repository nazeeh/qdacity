package com.qdacity.test.CodeEndpoint;

import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.concurrent.TimeUnit;

import javax.jdo.PersistenceManager;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.PMF;
import com.qdacity.endpoint.CodeEndpoint;
import com.qdacity.project.codesystem.Code;
import com.qdacity.project.codesystem.CodeBookEntry;
import com.qdacity.test.CodeSystemEndpoint.CodeSystemTestHelper;
import com.qdacity.test.ProjectEndpoint.ProjectEndpointTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;

public class CodeEndpointTest {
	private final LocalTaskQueueTestConfig.TaskCountDownLatch latch = new LocalTaskQueueTestConfig.TaskCountDownLatch(1);

	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(false).setCallbackClass(LocalTaskQueueTestConfig.DeferredTaskCallback.class).setTaskExecutionLatch(latch));

	private final com.google.api.server.spi.auth.common.User testUser = new com.google.api.server.spi.auth.common.User("123456", "asd@asd.de");

	@Before
	public void setUp() {
		helper.setUp();
	}

	@After
	public void tearDown() {
		helper.tearDown();
	}

	/**
	 * Tests if a registered user can create a new code for a code system
	 * 
	 * @throws InterruptedException
	 */
	@Test
	public void testCodeInsert() {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

		CodeSystemTestHelper.addCodeSystem(1L, testUser);
		assertEquals(1, ds.prepare(new Query("Code")).countEntities(withLimit(10)));
		try {
			ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, testUser);
		} catch (UnauthorizedException e) {
			fail("User could not be authorized for code creation");
			e.printStackTrace();
		}
		CodeEndpointTestHelper.addCode(22L, 2L, 1L, 1L, "authorName", "fff", testUser);

		try {
			latch.await(5, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
			fail("Deferred task for logging the change of inserting a code could not finish");
		}
		assertEquals(2, ds.prepare(new Query("Code")).countEntities(withLimit(10))); // it is two because of the codesystem

	}

	/**
	 * Tests if a registered user can remove a code for a code system
	 */
	@Test
	public void testCodeRemove() {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		testCodeInsert();
		assertEquals(2, ds.prepare(new Query("Code")).countEntities(withLimit(10)));
		CodeEndpointTestHelper.removeCode(22L, testUser);


		assertEquals(1, ds.prepare(new Query("Code")).countEntities(withLimit(10)));

	}

	/**
	 * Tests if a registered user can update the properties of a code in a project he is authorized for
	 */
	@Test
	public void testCodeUpdate() {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		testCodeInsert();
		assertEquals(2, ds.prepare(new Query("Code")).countEntities(withLimit(10)));

		PersistenceManager mgr = getPersistenceManager();
		mgr.setIgnoreCache(true);
		try {
			Code code = mgr.getObjectById(Code.class, 22L);
			code.setColor("f0f");
			CodeEndpointTestHelper.updateCode(code, testUser);
			code = mgr.getObjectById(Code.class, 22L);
			assertEquals("f0f", code.getColor());
		} finally {
			mgr.close();
		}
		assertEquals(2, ds.prepare(new Query("Code")).countEntities(withLimit(10)));

	}

	/**
	 * Tests if a registered user can relocate the properties of a code in a project he is authorized for
	 * 
	 * @throws UnauthorizedException
	 */
	@Test
	public void testCodeRelocate() throws UnauthorizedException {
		CodeEndpoint ce = new CodeEndpoint();
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		testCodeInsert();
		CodeEndpointTestHelper.addCode(33L, 3L, 1L, 1L, "authorName", "fff", testUser);
		CodeEndpointTestHelper.addCode(44L, 4L, 1L, 1L, "authorName", "fff", testUser);
		assertEquals(4, ds.prepare(new Query("Code")).countEntities(withLimit(10)));

		PersistenceManager mgr = getPersistenceManager();
		mgr.setIgnoreCache(true);
		mgr.setMultithreaded(true);
		try {
			Code code = mgr.getObjectById(Code.class, 22L);
			assertEquals(new Long(1), code.getParentID());

			code = ce.getCode(44L, testUser);
			assertEquals(new Long(1), code.getParentID());
			CodeEndpointTestHelper.relocateCode(33L, 2L, testUser);
			CodeEndpointTestHelper.relocateCode(44L, 2L, testUser);

			code = mgr.getObjectById(Code.class, 33L);
			assertEquals(new Long(2), code.getParentID());

			code = ce.getCode(44L, testUser);
			assertEquals(new Long(2), code.getParentID());

			CodeEndpointTestHelper.relocateCode(44L, 3L, testUser);
			CodeEndpointTestHelper.relocateCode(44L, 3L, testUser);

			code = ce.getCode(44L, testUser);
			assertEquals(new Long(3), code.getParentID());

		} finally {
			mgr.close();
		}

	}

	/**
	 * Tests if a registered user can add a code book entry of a code in a project he is authorized for
	 * 
	 * @throws UnauthorizedException
	 */
	@Test
	public void testCodeBookEntry() throws UnauthorizedException {
		CodeEndpoint ce = new CodeEndpoint();
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		testCodeInsert();
		CodeEndpointTestHelper.addCode(33L, 3L, 1L, 1L, "authorName", "fff", testUser);
		CodeBookEntry entry = new CodeBookEntry();
		entry.setDefinition("my new definition");
		entry.setExample("my new example");
		entry.setShortDefinition("my short definition");
		entry.setWhenNotToUse("dont use this code");
		entry.setWhenToUse("use this code");
		ce.setCodeBookEntry(33L, entry, testUser);
		
		Code code = ce.getCode(33L, testUser);
		CodeBookEntry cbe = code.getCodeBookEntry();
		assertEquals("my new definition", cbe.getDefinition());
		assertEquals("my new example", cbe.getExample());
		assertEquals("my short definition", cbe.getShortDefinition());
		assertEquals("dont use this code", cbe.getWhenNotToUse());
		assertEquals("use this code", cbe.getWhenToUse());
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}
