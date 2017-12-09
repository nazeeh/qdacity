package com.qdacity.test.MetaModelEndpoint;

import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
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
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.PMF;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.endpoint.MetaModelEntityEndpoint;
import com.qdacity.endpoint.UserEndpoint;
import com.qdacity.metamodel.MetaModelEntity;
import com.qdacity.test.UmlCodePositionEndpoint.UmlCodePositionEndpointTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;
import com.qdacity.user.LoginProviderType;

public class MetaModelEndpointTest {
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
	public void testListEntities() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "Owner", "Guy", testUser);

		UserEndpoint ue = new UserEndpoint();
		try {
			ue.updateUserType("123456", "ADMIN", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}

		MetaModelEndpointTestHelper.setUpDefaultMetaModel(testUser);

		MetaModelEntityEndpoint mme = new MetaModelEntityEndpoint();
		List<MetaModelEntity> entities = mme.listEntities(1L, testUser);

		assertEquals(21, entities.size());
	}
	
	@Test
	public void testInsertEntity() throws UnauthorizedException {
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();

		UserEndpointTestHelper.addUser("asd@asd.de", "Owner", "Guy", testUser);
		
		UserEndpoint ue = new UserEndpoint();
		try {
			ue.updateUserType("123456", "ADMIN", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized");
		}
		
		// Test insert
		assertEquals(0, ds.prepare(new Query("MetaModelEntity")).countEntities(withLimit(10)));
		
		MetaModelEndpointTestHelper.insertMetaModelEntity(51L, "Concept", 1, testUser);

		try {
			latch.await(5, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
			fail("Deferred task for logging the change of inserting a metaModelEntity could not finish");
		}
		
		assertEquals(1, ds.prepare(new Query("MetaModelEntity")).countEntities(withLimit(10)));
	}



	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}