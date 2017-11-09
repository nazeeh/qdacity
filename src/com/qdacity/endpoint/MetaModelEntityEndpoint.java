package com.qdacity.endpoint;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;

import com.google.api.server.spi.auth.EspAuthenticator;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.api.server.spi.auth.common.User;
import com.qdacity.Authorization;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.metamodel.MetaModelEntity;

/**
 * This class provides the public api interface for the MetaModelEntity.
 */
@Api(name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"),
	authenticators = {FirebaseAuthenticator.class})
public class MetaModelEntityEndpoint {
	
	@ApiMethod(name = "metaModelEntity.listEntities")
	public List<MetaModelEntity> listEntities( @Named("metaModelId") Long metaModelId, User user) throws UnauthorizedException {

		if (user == null) throw new UnauthorizedException("User not authorized");

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
	
	/**
	 * Inserts a new MetaModelEntity object into the database. If the entity exists, an exception is thrown.
	 * 
	 * @param entity to be inserted
	 * @return the inserted entity
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "metaModelEntity.insertMetaModelEntity")
	public MetaModelEntity insertMetaModelEntity(MetaModelEntity metaModelEntity, User user) throws UnauthorizedException {

		Authorization.checkAuthorization(metaModelEntity, user);
		
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (metaModelEntity.getId() != null && containsMetaModelEntity(metaModelEntity)) {
				throw new EntityExistsException("MetaModelEntity already exists " + metaModelEntity.getId());
			}

			mgr.makePersistent(metaModelEntity);

		} finally {
			mgr.close();
		}
		return metaModelEntity;
	}
	
	
	/**
	 * Reads a MetaModelEntity with the given name from the database. Only one entity is returned.
	 * 
	 * @param name name of the entity
	 * @param user required for authorization
	 * @return the entity with the given name
	 * @throws UnauthorizedException
	 */
	@SuppressWarnings("unchecked")
	List<MetaModelEntity> getMetaModelEntitiesByName(String name, User user) throws UnauthorizedException {

		if (user == null) throw new UnauthorizedException("User not authorized");

		List<MetaModelEntity> metaModelEntities = null;
		
		PersistenceManager mgr = getPersistenceManager();
		try {			
			Query query = mgr.newQuery(MetaModelEntity.class);
			query.setFilter("name == :name");
			
			Map<String, String> params = new HashMap<>();
			params.put("name", name);
			
			metaModelEntities = (List<MetaModelEntity>) query.executeWithMap(params);
			
		} finally {
			mgr.close();
		}
		
		return metaModelEntities;
	}	

	/**
	 * Checks whether the entity exists in the database.
	 * 
	 * @param metaModelEntity
	 * @return Returns true if they entity exists already
	 */
	private boolean containsMetaModelEntity(MetaModelEntity metaModelEntity) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(MetaModelEntity.class, metaModelEntity.getId());
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


