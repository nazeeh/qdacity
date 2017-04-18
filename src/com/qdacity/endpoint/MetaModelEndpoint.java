package com.qdacity.endpoint;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.users.User;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.metamodel.MetaModelEntity;
import com.qdacity.metamodel.MetaModelRelation;

@Api(name = "qdacity",
version = Constants.API_VERSION,
namespace = @ApiNamespace(ownerDomain = "qdacity.com",
	ownerName = "qdacity.com",
	packagePath = "server.project"))
public class MetaModelEndpoint {
	
	@ApiMethod(name = "metamodel.listEntities",
			scopes = { Constants.EMAIL_SCOPE },
			clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
			audiences = { Constants.WEB_CLIENT_ID })
		public List<MetaModelEntity> listProject( @Named("metaModelId") Long metaModelId, User user) throws UnauthorizedException {

			if (user == null) throw new UnauthorizedException("User not authorized"); // TODO currently no user is authorized to list all projects

			PersistenceManager mgr = null;
			List<MetaModelEntity> entities = null;

			try {
				mgr = getPersistenceManager();

				Query q;
				q = mgr.newQuery(MetaModelEntity.class, " metaModelId == :metaModelId");

				Map<String, Long> params = new HashMap<String, Long>();
				params.put("metaModelId", metaModelId);
				
				entities = (List<MetaModelEntity>) q.executeWithMap(params);

				// Tight loop for fetching all entities from datastore and accomodate
				// for lazy fetch.
				for (MetaModelEntity obj : entities);
			} finally {
				mgr.close();
			}

			return entities;
		}
	
	@ApiMethod(name = "metamodel.listRelations",
			scopes = { Constants.EMAIL_SCOPE },
			clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
			audiences = { Constants.WEB_CLIENT_ID })
		public List<MetaModelRelation> listRelations( @Named("metaModelId") Long metaModelId, User user) throws UnauthorizedException {

			if (user == null) throw new UnauthorizedException("User not authorized"); // TODO currently no user is authorized to list all projects

			PersistenceManager mgr = null;
			List<MetaModelRelation> relations = null;

			try {
				mgr = getPersistenceManager();

				Query q;
				q = mgr.newQuery(MetaModelRelation.class, " metaModelId == :metaModelId");

				Map<String, Long> params = new HashMap<String, Long>();
				params.put("metaModelId", metaModelId);
				
				relations = (List<MetaModelRelation>) q.executeWithMap(params);

				// Tight loop for fetching all entities from datastore and accomodate
				// for lazy fetch.
				for (MetaModelRelation obj : relations);
			} finally {
				mgr.close();
			}

			return relations;
		}
	
	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

}


