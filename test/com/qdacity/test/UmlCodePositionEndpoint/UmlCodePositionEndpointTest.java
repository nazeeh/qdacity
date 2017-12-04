package com.qdacity.test.UmlCodePositionEndpoint;

import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.ArrayList;
import java.util.List;
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
import com.qdacity.test.CodeEndpoint.CodeEndpointTestHelper;
import com.qdacity.test.CodeSystemEndpoint.CodeSystemTestHelper;
import com.qdacity.test.ProjectEndpoint.ProjectEndpointTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;
import com.qdacity.umleditor.UmlCodePosition;

public class UmlCodePositionEndpointTest {
	private final LocalTaskQueueTestConfig.TaskCountDownLatch latch = new LocalTaskQueueTestConfig.TaskCountDownLatch(1);

	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(false).setCallbackClass(LocalTaskQueueTestConfig.DeferredTaskCallback.class).setTaskExecutionLatch(latch));

	private final com.google.appengine.api.users.User testUser = new com.google.appengine.api.users.User("asd@asd.de", "bla", "123456");

	@Before
	public void setUp() {
		helper.setUp();
		
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);

 		// Prepare project and codesystem
 		CodeSystemTestHelper.addCodeSystem(1L, testUser);
 		
		try {
			ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, testUser);
		} catch (UnauthorizedException e) {
			fail("Could not create a project");
			e.printStackTrace();
		}
	}

	@After
	public void tearDown() {
		helper.tearDown();
	}
	
	/**
	 * Tests if a registered user can insert a new UmlCodePosition.
	 */
	@Test
	public void testSimpleInsert() {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
 		
		// Test insert
		assertEquals(0, ds.prepare(new Query("UmlCodePosition")).countEntities(withLimit(10)));
		
		UmlCodePositionEndpointTestHelper.insertUmlCodePosition(22L, 2L, 1L, 122.245, -12388.0211, testUser);

		try {
			latch.await(5, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
			fail("Deferred task for logging the change of inserting a umlCodePosition could not finish");
		}
		
		assertEquals(1, ds.prepare(new Query("UmlCodePosition")).countEntities(withLimit(10)));
	}

	/**
	 * Tests if a registered user can insert multiple new UmlCodePositions.
	 */
	@Test
	public void testMultipleInsert() {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
 		
		// Test insert
		assertEquals(0, ds.prepare(new Query("UmlCodePosition")).countEntities(withLimit(10)));
		
		List<UmlCodePosition> codePositions = new ArrayList<UmlCodePosition>();
		
		UmlCodePosition position;
		
		position = new UmlCodePosition();
		position.setId(23L);
		position.setCodeId(1L);
		position.setCodesystemId(1L);
		position.setX(20.9289);
		position.setY(11002.0);
		codePositions.add(position);
		
		position = new UmlCodePosition();
		position.setId(24L);
		position.setCodeId(2L);
		position.setCodesystemId(1L);
		position.setX(9);
		position.setY(-7.0);
		codePositions.add(position);
		
		position = new UmlCodePosition();
		position.setId(25L);
		position.setCodeId(3L);
		position.setCodesystemId(1L);
		position.setX(-55.5);
		position.setY(0);
		codePositions.add(position);
		
		UmlCodePositionEndpointTestHelper.insertOrUpdateUmlCodePositions(codePositions, testUser);

		try {
			latch.await(5, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
			fail("Deferred task for logging the change of inserting a umlCodePosition could not finish");
		}
		
		assertEquals(3, ds.prepare(new Query("UmlCodePosition")).countEntities(withLimit(10)));
	}
	
	/**
	 * Tests if a registered user can remove a umlCodePosition
	 */
	@Test
	public void testUmlCodePositionRemove() {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		
		testSimpleInsert();

		assertEquals(1, ds.prepare(new Query("UmlCodePosition")).countEntities(withLimit(10)));
		
		UmlCodePositionEndpointTestHelper.removeUmlCodePosition(22L, testUser);

		assertEquals(0, ds.prepare(new Query("UmlCodePosition")).countEntities(withLimit(10)));		
	}
	

	/**
	 * Tests if a registered user can list the umlCodePositions of a codesystem
	 */
	@Test
	public void testListUmlCodePositions() {		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		
		// Prepare another codesystem and project
		CodeSystemTestHelper.addCodeSystem(2L, testUser);
 		
		try {
			ProjectEndpointTestHelper.addProject(2L, "New Project", "A description", 2L, testUser);
		} catch (UnauthorizedException e) {
			fail("Could not create a project");
			e.printStackTrace();
		}
		
		// Prepare umlCodePositions
		List<UmlCodePosition> codePositions = new ArrayList<UmlCodePosition>();
		UmlCodePosition position;
		
		position = new UmlCodePosition();
		position.setId(100L);
		position.setCodeId(1L);
		position.setCodesystemId(1L);
		position.setX(0);
		position.setY(0);
		codePositions.add(position);
		
		position = new UmlCodePosition();
		position.setId(101L);
		position.setCodeId(2L);
		position.setCodesystemId(1L);
		position.setX(0);
		position.setY(0);
		codePositions.add(position);
		
		position = new UmlCodePosition();
		position.setId(102L);
		position.setCodeId(3L);
		position.setCodesystemId(1L);
		position.setX(0);
		position.setY(0);
		codePositions.add(position);

		UmlCodePositionEndpointTestHelper.insertOrUpdateUmlCodePositions(codePositions, testUser);
		
		codePositions = new ArrayList<UmlCodePosition>();
		
		position = new UmlCodePosition();
		position.setId(200L);
		position.setCodeId(10L);
		position.setCodesystemId(2L);
		position.setX(0);
		position.setY(0);
		codePositions.add(position);

		position = new UmlCodePosition();
		position.setId(201L);
		position.setCodeId(11L);
		position.setCodesystemId(2L);
		position.setX(0);
		position.setY(0);
		codePositions.add(position);

		UmlCodePositionEndpointTestHelper.insertOrUpdateUmlCodePositions(codePositions, testUser);

		assertEquals(5, ds.prepare(new Query("UmlCodePosition")).countEntities(withLimit(10)));
		
		List<UmlCodePosition> resultCodesystem1 = UmlCodePositionEndpointTestHelper.listUmlCodePositions(1L, testUser);
		List<UmlCodePosition> resultCodesystem2 = UmlCodePositionEndpointTestHelper.listUmlCodePositions(2L, testUser);
		assertEquals(resultCodesystem1.size(), 3);
		assertEquals(resultCodesystem2.size(), 2);
	}
	
	/**
	 * Tests if a registered user can update multiple umlCodePositions of a codesystem
	 */
	@Test
	public void testUpdate() {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();

		// Insert
		assertEquals(0, ds.prepare(new Query("UmlCodePosition")).countEntities(withLimit(10)));
		
		UmlCodePositionEndpointTestHelper.insertUmlCodePosition(22L, 1L, 1L, 20, 30, testUser);
		UmlCodePositionEndpointTestHelper.insertUmlCodePosition(23L, 2L, 1L, 40, 50, testUser);

		assertEquals(2, ds.prepare(new Query("UmlCodePosition")).countEntities(withLimit(10)));
		
		// Update
		PersistenceManager mgr = getPersistenceManager();
		mgr.setIgnoreCache(true);
		try {
			List<UmlCodePosition> objects = UmlCodePositionEndpointTestHelper.listUmlCodePositions(1L, testUser);
			
			UmlCodePosition umlCodePositionA = objects.get(0);
			UmlCodePosition umlCodePositionB = objects.get(1);

			assertEquals(20, umlCodePositionA.getX(), 0);
			assertEquals(30, umlCodePositionA.getY(), 0);

			assertEquals(40, umlCodePositionB.getX(), 0);
			assertEquals(50, umlCodePositionB.getY(), 0);
			
			umlCodePositionA.setX(200);
			umlCodePositionA.setY(300);

			umlCodePositionB.setX(400);
 			umlCodePositionB.setY(500);
			
			List<UmlCodePosition> update = new ArrayList<>();
			update.add(umlCodePositionA);
			update.add(umlCodePositionB);
			
			UmlCodePositionEndpointTestHelper.insertOrUpdateUmlCodePositions(update, testUser);

            objects = UmlCodePositionEndpointTestHelper.listUmlCodePositions(1L, testUser);
			
			umlCodePositionA = objects.get(0);
			umlCodePositionB = objects.get(1);

			assertEquals(200, umlCodePositionA.getX(), 0);
			assertEquals(300, umlCodePositionA.getY(), 0);

			assertEquals(400, umlCodePositionB.getX(), 0);
			assertEquals(500, umlCodePositionB.getY(), 0);
		} finally {
			mgr.close();
		}

		assertEquals(2, ds.prepare(new Query("UmlCodePosition")).countEntities(withLimit(10)));
	}
	
	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}
