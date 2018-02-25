package com.qdacity.endpoint;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.Authorization;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.authentication.QdacityAuthenticator;
import com.qdacity.metamodel.MetaModelRelation;


/**
 * This class provides the public api interface for the MetaModelRelation.
 */
@Api(name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"),
	authenticators = {QdacityAuthenticator.class})
public class MetaModelRelationEndpoint {

	@SuppressWarnings("unchecked")
	@ApiMethod(name = "metaModelRelation.listRelations")
	public List<MetaModelRelation> listRelations( @Named("metaModelId") Long metaModelId, User user) throws UnauthorizedException {

		if (user == null) throw new UnauthorizedException("User not authorized");

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
			for (@SuppressWarnings("unused") MetaModelRelation obj : relations);
		} finally {
			mgr.close();
		}

		return relations;
	}
	
	/**
	 * Inserts a new MetaModelRelation object into the database. If the entity exists, an exception is thrown.
	 * 
	 * @param entity to be inserted
	 * @return the inserted entity
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "metaModelRelation.insertMetaModelRelation")
	public MetaModelRelation insertMetaModelRelation(MetaModelRelation metaModelRelation, User user) throws UnauthorizedException {

		Authorization.checkAuthorization(metaModelRelation, user);
		
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (metaModelRelation.getId() != null && containsMetaModelRelation(metaModelRelation)) {
				throw new EntityExistsException("MetaModelEntity already exists " + metaModelRelation.getId());
			}

			mgr.makePersistent(metaModelRelation);

		} finally {
			mgr.close();
		}
		return metaModelRelation;
	}
	
	/**
	 * Checks whether the entity exists in the database.
	 * 
	 * @param metaModelRelation
	 * @return Returns true if they entity exists already
	 */
	private boolean containsMetaModelRelation(MetaModelRelation metaModelRelation) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(MetaModelRelation.class, metaModelRelation.getId());
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			contains = false;
		} finally {
			mgr.close();
		}
		return contains;
	}
	
	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}
