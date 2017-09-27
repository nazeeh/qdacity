package com.qdacity.test.Saturation;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.endpoint.SaturationEndpoint;
import com.qdacity.project.saturation.SaturationParameters;
import com.qdacity.test.CodeSystemEndpoint.CodeSystemTestHelper;
import com.qdacity.test.ProjectEndpoint.ProjectEndpointTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;

public class SaturationTest {
	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(true));

	private final com.google.appengine.api.users.User testUser = new com.google.appengine.api.users.User("asd@asd.de", "bla", "123456");
	private final SaturationEndpoint se = new SaturationEndpoint();
	@Before
	public void setUp() {
		helper.setUp();
	}

	@After
	public void tearDown() {
		helper.tearDown();
	}

	private void setUpProject() {
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
	 */
	@Test
	public void testDefaultParameters() {
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

	@Test
	public void testSaturationTrigger() {
		setUpProject();
	}
}
