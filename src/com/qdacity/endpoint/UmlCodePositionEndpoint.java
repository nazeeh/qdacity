package com.qdacity.endpoint;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.users.User;
import com.qdacity.Authorization;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.metamodel.MetaModelEntity;
import com.qdacity.project.codesystem.Code;
import com.qdacity.umleditor.UmlCodePosition;
import com.qdacity.umleditor.UmlCodePositionList;

/**
 * Provides the api and database operations on UmlCodePositions.
 */
@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"))
public class UmlCodePositionEndpoint {

	/**
	 * Returns a list of UmlCodePosition entities.
	 * 
	 * @param codeSystemId  specifies which CodePositionEntities will be returned
	 * @throws UnauthorizedException
	 */
	@ApiMethod(
		name = "umlCodePosition.listCodePositions",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID })
	public List<UmlCodePosition> listCodePositions(@Named("codeSystemId") Long codeSystemId, User user) throws UnauthorizedException {

		// Check if user is authorized
		final UmlCodePosition authCodePosition = new UmlCodePosition();
		authCodePosition.setCodeSystemId(codeSystemId);
		Authorization.checkAuthorization(authCodePosition, user);
		
		List<UmlCodePosition> umlCodePositions = new ArrayList<>();

		PersistenceManager mgr = getPersistenceManager();
		try {
			Query query = mgr.newQuery(UmlCodePosition.class, " codeSystemId == :codeSystemId");

			Map<String, Long> params = new HashMap<String, Long>();
			params.put("codeSystemId", codeSystemId);
			
			umlCodePositions = (List<UmlCodePosition>) query.executeWithMap(params);

		} finally {
			mgr.close();
		}
		
		return umlCodePositions;
	}
	
	/**
	 * Inserts multiple UmlCodePosition entities into the database.
	 * 
	 * @param umlCodePositionList  the code position entities
	 * @throws UnauthorizedException
	 */
	@ApiMethod(
		name = "umlCodePosition.insertCodePositions",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID })
	public List<UmlCodePosition> insertCodePositions(UmlCodePositionList umlCodePositionList, User user) throws UnauthorizedException {

		final List<UmlCodePosition> umlCodePositions = umlCodePositionList.getUmlCodePositions();
		Collection<UmlCodePosition> result;
		
		PersistenceManager mgr = getPersistenceManager();
		try {
			for (int i = 0; i < umlCodePositions.size(); i++) {		
				UmlCodePosition umlCodePosition = umlCodePositions.get(i);
				umlCodePosition.setId(null);
				
				// Check if user is authorized
				Authorization.checkAuthorization(umlCodePosition, user);

				// Validate
				validateUmlCodePosition(umlCodePosition);
				
				// Entity exists?
				if (umlCodePosition.getId() != null && containsUmlCodePosition(umlCodePosition)) {
					throw new EntityExistsException("MetaModelEntity already exists " + umlCodePosition.getId());
				}
			}

			// Persist
			result = mgr.makePersistentAll(umlCodePositions);
			
		} finally {
			mgr.close();
		}
		
		return new ArrayList<>(result);
	}

	/**
	 * Updates multiple UmlCodePosition entries.
	 * 
	 * @param umlCodePositionList  the list of entities to be updated.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(
		name = "umlCodePosition.updateCodePositions",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID })
	public List<UmlCodePosition> updateCodePositions(UmlCodePositionList umlCodePositionList, User user) throws UnauthorizedException {

		final List<UmlCodePosition> umlCodePositions = umlCodePositionList.getUmlCodePositions();
		Collection<UmlCodePosition> result;
		
		PersistenceManager mgr = getPersistenceManager();
		try {
			for (int i = 0; i < umlCodePositions.size(); i++) {		
				UmlCodePosition umlCodePosition = umlCodePositions.get(i);

				// Check if user is authorized
				Authorization.checkAuthorization(umlCodePosition, user);
				
				// Validate
				validateUmlCodePosition(umlCodePosition);
				
				UmlCodePosition databaseObject = mgr.getObjectById(UmlCodePosition.class, umlCodePosition.getId());
								
				if (databaseObject == null) {
					throw new EntityNotFoundException("Object does not exist. id: " + umlCodePosition.getId() + ", codeSystemId: " + umlCodePosition.getCodeSystemId() + ", codeId: " + umlCodePosition.getCodeId());
				}
				
				databaseObject.setX(umlCodePosition.getX());
				databaseObject.setY(umlCodePosition.getY());
				
				umlCodePositions.set(i, databaseObject);
			}

			// Persist
			result = mgr.makePersistentAll(umlCodePositions);
			
		} finally {
			mgr.close();
		}

		return new ArrayList<>(result);
	}
	
	/**
	 * Checks whether an UmlCodePosition object is valid.
	 * 
	 * @param umlCodePosition
	 */
	private void validateUmlCodePosition(UmlCodePosition umlCodePosition) {
		if (umlCodePosition.getCodeId() == null || umlCodePosition.getCodeId() <= 0) {
			throw new IllegalArgumentException("UmlCodePosition codeId may not be null or empty");
		}
		if (umlCodePosition.getCodeSystemId() == null || umlCodePosition.getCodeSystemId() <= 0) {
			throw new IllegalArgumentException("UmlCodePosition codeSystemId may not be null or empty");
		}
	}

	/**
	 * Checks whether the entity exists in the database.
	 * 
	 * @param umlCodePosition
	 * @return Returns true if they entity exists already
	 */
	private boolean containsUmlCodePosition(UmlCodePosition umlCodePosition) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(MetaModelEntity.class, umlCodePosition.getId());
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
	