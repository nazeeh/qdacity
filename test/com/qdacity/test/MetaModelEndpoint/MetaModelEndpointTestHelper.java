package com.qdacity.test.MetaModelEndpoint;

import static org.junit.Assert.fail;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.endpoint.MaintenanceEndpoint;
import com.qdacity.endpoint.MetaModelEntityEndpoint;
import com.qdacity.metamodel.MetaModelEntity;



public class MetaModelEndpointTestHelper {
	public static String originalText = "<p><coding id=\"1\" code_id=\"1\">First paragraph</coding></p><p><coding id=\"2\" code_id=\"1\">Second paragraph</coding></p><p>Third paragraph</p><p>Fourth paragraph</p><p>Fifth paragraph</p><p>Sixth paragraph</p><p>Seventh paragraph</p><p>Eighth paragraph</p>";
	public static String recodedText = "<p><coding id=\"1\" code_id=\"1\">First paragraph</coding></p><p>Second paragraph</p><p>Third paragraph</p><p>Fourth paragraph</p><p>Fifth paragraph</p><p>Sixth paragraph</p><p>Seventh paragraph</p><p>Eighth paragraph</p>";

	static public void setUpDefaultMetaModel(User googleUser) {
		MaintenanceEndpoint me = new MaintenanceEndpoint();
		try {
			me.initializeDatabase(true, googleUser);
		} catch (UnauthorizedException e) {
			fail("Failed to initialize database with default meta model");
			e.printStackTrace();
		}
	}
	
	static public void insertMetaModelEntity(Long id, String name, int group, com.google.api.server.spi.auth.common.User loggedInUser) {
		try {
			final MetaModelEntity metaModelEntity = new MetaModelEntity();
			metaModelEntity.setId(id);
			metaModelEntity.setName(name);
			metaModelEntity.setGroup(group);
			
			MetaModelEntityEndpoint endpoint = new MetaModelEntityEndpoint();
			endpoint.insertMetaModelEntity(metaModelEntity, loggedInUser);

		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for metaModelEntity creation");
		}
	}
}
