package com.qdacity.test.Saturation;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.PMF;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.endpoint.ProjectEndpoint;
import com.qdacity.endpoint.SaturationEndpoint;
import com.qdacity.project.ProjectRevision;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.saturation.SaturationParameters;
import com.qdacity.project.saturation.SaturationResult;
import com.qdacity.test.CodeSystemEndpoint.CodeSystemTestHelper;
import com.qdacity.test.ProjectEndpoint.ProjectEndpointTestHelper;
import com.qdacity.test.TextDocumentEndpointTest.TextDocumentEndpointTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;
import com.qdacity.user.LoginProviderType;

public class SaturationTest {
	private final LocalTaskQueueTestConfig.TaskCountDownLatch latch = new LocalTaskQueueTestConfig.TaskCountDownLatch(1);

	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(false).setCallbackClass(LocalTaskQueueTestConfig.DeferredTaskCallback.class).setTaskExecutionLatch(latch));
	private final com.google.api.server.spi.auth.common.User testUser = new AuthenticatedUser("123456", "asd@asd.de", LoginProviderType.GOOGLE);

	private final SaturationEndpoint se = new SaturationEndpoint();
	@Before
	public void setUp() {
		helper.setUp();
	}

	@After
	public void tearDown() {
		helper.tearDown();
	}

	private void setUpProject() throws UnauthorizedException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		CodeSystemTestHelper.addCodeSystem(1L, testUser);
		try {
			ProjectEndpointTestHelper.addProject(1L, "New Project", "A description", 1L, testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for project creation");
		}
	}

	/**
	 * Tests if the default parameters are loaded if none have been specified for a given project
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testDefaultParameters() throws UnauthorizedException {
		setUpProject();
		try {
			SaturationParameters params = se.getSaturationParameters(1L);
			//===== SATURATION WEIGHTS =============
			// Document Changes
			assertEquals(0.0, params.getInsertDocumentChangeWeight(), 0);
			
			//Code Changes
			assertEquals(1.0, params.getInsertCodeChangeWeight(), 0);
			assertEquals(0.0, params.getUpdateCodeAuthorChangeWeight(), 0);
			assertEquals(0.0, params.getUpdateCodeColorChangeWeight(), 0);
			assertEquals(0.5, params.getUpdateCodeMemoChangeWeight(), 0);
			assertEquals(1.0, params.getUpdateCodeNameChangeWeight(), 0);
			assertEquals(1.0, params.getRelocateCodeChangeWeight(), 0);
			assertEquals(0.75, params.getInsertCodeRelationShipChangeWeight(), 0);
			assertEquals(1.0, params.getDeleteCodeChangeWeight(), 0);
			assertEquals(0.75, params.getDeleteCodeRelationShipChangeWeight(), 0);
			assertEquals(1.0, params.getDeleteCodeChangeWeight(), 0);
			assertEquals(0.2, params.getAppliedCodesChangeWeight(), 0);
			//CodeBookEntry Changes
			assertEquals(1.0, params.getUpdateCodeBookEntryDefinitionChangeWeight(), 0);
			assertEquals(0.75, params.getUpdateCodeBookEntryExampleChangeWeight(), 0);
			assertEquals(1.0, params.getUpdateCodeBookEntryShortDefinitionChangeWeight(), 0);
			assertEquals(0.75, params.getUpdateCodeBookEntryWhenNotToUseChangeWeight(), 0);
			assertEquals(0.75, params.getUpdateCodeBookEntryWhenToUseChangeWeight(), 0);
			
			// ===== SATURATION MAXIMA =============
			assertEquals(1.0, params.getInsertDocumentSaturationMaximum(), 0);
			// Code Changes
			assertEquals(1.0, params.getInsertCodeSaturationMaximum(), 0);
			assertEquals(0.1, params.getUpdateCodeAuthorSaturationMaximum(), 0);
			assertEquals(0.1, params.getUpdateCodeColorSaturationMaximum(), 0);
			assertEquals(0.9, params.getUpdateCodeMemoSaturationMaximum(), 0);
			assertEquals(1.0, params.getUpdateCodeNameSaturationMaximum(), 0);
			assertEquals(1.0, params.getRelocateCodeSaturationMaximum(), 0);
			assertEquals(0.95, params.getInsertCodeRelationShipSaturationMaximum(), 0);
			assertEquals(0.95, params.getDeleteCodeRelationShipSaturationMaximum(), 0);
			assertEquals(1.0, params.getDeleteCodeSaturationMaximum(), 0);
			assertEquals(0.75, params.getAppliedCodesSaturationMaximum(), 0);
			// CodeBookEntry Changes
			assertEquals(1.0, params.getUpdateCodeBookEntryDefinitionSaturationMaximum(), 0);
			assertEquals(0.9, params.getUpdateCodeBookEntryExampleSaturationMaximum(), 0);
			assertEquals(1.0, params.getUpdateCodeBookEntryShortDefinitionSaturationMaximum(), 0);
			assertEquals(0.9, params.getUpdateCodeBookEntryWhenNotToUseSaturationMaximum(), 0);
			assertEquals(0.9, params.getUpdateCodeBookEntryWhenToUseSaturationMaximum(), 0);

		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("default saturation parameters could not be retrieved");
		}
	}

	/**
	 * Tests if the parameters can be changed and persisted
	 * @throws UnauthorizedException 
	 */
	@Test
	public void testSetParameters() throws UnauthorizedException {
		setUpProject();
		try {
			SaturationParameters params = se.getSaturationParameters(1L);

			params.setInsertDocumentChangeWeight(2);
			// Code Changes
			params.setInsertCodeChangeWeight(3);
			params.setUpdateCodeAuthorChangeWeight(4);
			params.setUpdateCodeColorChangeWeight(5);
			params.setUpdateCodeMemoChangeWeight(6);

			params.setUpdateCodeNameChangeWeight(7);
			params.setRelocateCodeChangeWeight(8);
			params.setInsertCodeRelationShipChangeWeight(9);
			params.setDeleteCodeRelationShipChangeWeight(10);
			params.setDeleteCodeChangeWeight(11);
			params.setAppliedCodesChangeWeight(12);
			// CodeBookEntry Changes
			params.setUpdateCodeBookEntryDefinitionChangeWeight(13);
			params.setUpdateCodeBookEntryExampleChangeWeight(14);
			params.setUpdateCodeBookEntryShortDefinitionChangeWeight(15);
			params.setUpdateCodeBookEntryWhenNotToUseChangeWeight(16);
			params.setUpdateCodeBookEntryWhenToUseChangeWeight(17);

			// ===== SATURATION MAXIMA =============
			params.setInsertDocumentSaturationMaximum(18);
			// Code Changes
			params.setInsertCodeSaturationMaximum(19);
			params.setUpdateCodeAuthorSaturationMaximum(20);
			params.setUpdateCodeColorSaturationMaximum(21);
			params.setUpdateCodeMemoSaturationMaximum(22);
			params.setUpdateCodeNameSaturationMaximum(23);
			params.setRelocateCodeSaturationMaximum(24);
			params.setInsertCodeRelationShipSaturationMaximum(25);
			params.setDeleteCodeRelationShipSaturationMaximum(26);
			params.setDeleteCodeSaturationMaximum(27);
			params.setAppliedCodesSaturationMaximum(28);
			// CodeBookEntry Changes
			params.setUpdateCodeBookEntryDefinitionSaturationMaximum(29);
			params.setUpdateCodeBookEntryExampleSaturationMaximum(30);
			params.setUpdateCodeBookEntryShortDefinitionSaturationMaximum(31);
			params.setUpdateCodeBookEntryWhenNotToUseSaturationMaximum(32);
			params.setUpdateCodeBookEntryWhenToUseSaturationMaximum(33);

			se.setSaturationParameters(params, testUser);
			SaturationParameters paramsReloaded = se.getSaturationParameters(1L);

			// ===== SATURATION WEIGHTS =============
			// Document Changes
			assertEquals(2.0, paramsReloaded.getInsertDocumentChangeWeight(), 1);

			// Code Changes
			assertEquals(3, paramsReloaded.getInsertCodeChangeWeight(), 0);
			assertEquals(4, paramsReloaded.getUpdateCodeAuthorChangeWeight(), 0);
			assertEquals(5, paramsReloaded.getUpdateCodeColorChangeWeight(), 0);
			assertEquals(6, paramsReloaded.getUpdateCodeMemoChangeWeight(), 0);
			assertEquals(7, paramsReloaded.getUpdateCodeNameChangeWeight(), 0);
			assertEquals(8, paramsReloaded.getRelocateCodeChangeWeight(), 0);
			assertEquals(9, paramsReloaded.getInsertCodeRelationShipChangeWeight(), 0);

			assertEquals(10, paramsReloaded.getDeleteCodeRelationShipChangeWeight(), 0);
			assertEquals(11, paramsReloaded.getDeleteCodeChangeWeight(), 0);
			assertEquals(12, paramsReloaded.getAppliedCodesChangeWeight(), 0);
			// CodeBookEntry Changes
			assertEquals(13, paramsReloaded.getUpdateCodeBookEntryDefinitionChangeWeight(), 0);
			assertEquals(14, paramsReloaded.getUpdateCodeBookEntryExampleChangeWeight(), 0);
			assertEquals(15, paramsReloaded.getUpdateCodeBookEntryShortDefinitionChangeWeight(), 0);
			assertEquals(16, paramsReloaded.getUpdateCodeBookEntryWhenNotToUseChangeWeight(), 0);
			assertEquals(17, paramsReloaded.getUpdateCodeBookEntryWhenToUseChangeWeight(), 0);

			// ===== SATURATION MAXIMA =============
			assertEquals(18, paramsReloaded.getInsertDocumentSaturationMaximum(), 0);
			// Code Changes
			assertEquals(19, paramsReloaded.getInsertCodeSaturationMaximum(), 0);
			assertEquals(20, paramsReloaded.getUpdateCodeAuthorSaturationMaximum(), 0);
			assertEquals(21, paramsReloaded.getUpdateCodeColorSaturationMaximum(), 0);
			assertEquals(22, paramsReloaded.getUpdateCodeMemoSaturationMaximum(), 0);
			assertEquals(23, paramsReloaded.getUpdateCodeNameSaturationMaximum(), 0);
			assertEquals(24, paramsReloaded.getRelocateCodeSaturationMaximum(), 0);
			assertEquals(25, paramsReloaded.getInsertCodeRelationShipSaturationMaximum(), 0);
			assertEquals(26, paramsReloaded.getDeleteCodeRelationShipSaturationMaximum(), 0);
			assertEquals(27, paramsReloaded.getDeleteCodeSaturationMaximum(), 0);
			assertEquals(28, paramsReloaded.getAppliedCodesSaturationMaximum(), 0);
			// CodeBookEntry Changes
			assertEquals(29, paramsReloaded.getUpdateCodeBookEntryDefinitionSaturationMaximum(), 0);
			assertEquals(30, paramsReloaded.getUpdateCodeBookEntryExampleSaturationMaximum(), 0);
			assertEquals(31, paramsReloaded.getUpdateCodeBookEntryShortDefinitionSaturationMaximum(), 0);
			assertEquals(32, paramsReloaded.getUpdateCodeBookEntryWhenNotToUseSaturationMaximum(), 0);
			assertEquals(33, paramsReloaded.getUpdateCodeBookEntryWhenToUseSaturationMaximum(), 0);

		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("default saturation parameters could not be retrieved");
		}
	}

	@Test
	public void testSaturationTrigger() throws UnauthorizedException {
		setUpProject();
	}

	@Test
	public void testEvaluateRevisionAlpha() throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		latch.reset(2);

		UserEndpointTestHelper.addUser("asd@asd.de", "Owner", "Guy", testUser);

		ProjectEndpointTestHelper.setupProjectWithCodesystem(1L, "My Project", "I'm testing this to evaluate a revision", testUser);
		TextDocument doc = TextDocumentEndpointTestHelper.addTextDocument(1L, SaturationEndpointTestHelper.originalText, "Test Document", testUser);

		ProjectEndpoint pe = new ProjectEndpoint();
		try {
			ProjectRevision revision = pe.createSnapshot(1L, "A test revision", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User failed to be authorized for creating a snapshot");
		}
		doc.setText(new Text(SaturationEndpointTestHelper.recodedText));
		TextDocumentEndpointTestHelper.updateTextDocument(doc, testUser);

		try {
			latch.await(25, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
			fail("Deferred task did not finish in time");
		}

		Query query = mgr.newQuery(SaturationResult.class);
		query.setFilter("projectId == :id");
		Map<String, Long> paramValues = new HashMap<>();
		paramValues.put("id", 1L);
		List<SaturationResult> lazySatResults = (List<SaturationResult>) query.executeWithMap(paramValues);

		assertEquals(1, lazySatResults.size());
		latch.reset(1);
		try {
			pe.createSnapshot(1L, "A test revision", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User failed to be authorized for creating a snapshot");
		}

		try {
			latch.await(25, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
			fail("Deferred task did not finish in time");
		}

		latch.reset(1);
		try {
			pe.createSnapshot(1L, "A test revision", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User failed to be authorized for creating a snapshot");
		}

		try {
			latch.await(25, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
			fail("Deferred task did not finish in time");
		}
		latch.reset(1);

		// Only the n-th iteration will trigger calculation of saturation, otherwise it is 0
		try {
			pe.createSnapshot(1L, "A test revision", testUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User failed to be authorized for creating a snapshot");
		}

		try {
			latch.await(25, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
			fail("Deferred task did not finish in time");
		}
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}
