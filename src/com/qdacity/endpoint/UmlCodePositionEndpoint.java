package com.qdacity.endpoint;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;

import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityNotFoundException;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.users.User;
import com.qdacity.Authorization;
import com.qdacity.Constants;
import com.qdacity.PMF;
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
	 * @param codesystemId  specifies which CodePositionEntities will be returned
	 * @throws UnauthorizedException
	 */
	@ApiMethod(
		name = "umlCodePosition.listCodePositions",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID })
	public List<UmlCodePosition> listCodePositions(@Named("codesystemId") Long codesystemId, User user) throws UnauthorizedException {

		// Check if user is authorized
		final UmlCodePosition authCodePosition = new UmlCodePosition();
		authCodePosition.setCodesystemId(codesystemId);
		Authorization.checkAuthorization(authCodePosition, user);
		
		List<UmlCodePosition> umlCodePositions = new ArrayList<>();

		PersistenceManager mgr = getPersistenceManager();
		try {
			Query query = mgr.newQuery(UmlCodePosition.class, " codesystemId == :codesystemId");

			Map<String, Long> params = new HashMap<String, Long>();
			params.put("codesystemId", codesystemId);
			
			umlCodePositions = (List<UmlCodePosition>) query.executeWithMap(params);

		} finally {
			mgr.close();
		}
		
		return umlCodePositions;
	}
	
	/**
	 * Inserts or updates multiple UmlCodePosition entities into the database.
	 * 
	 * @param umlCodePositionList  the code position entities
	 * @throws UnauthorizedException
	 */
	@ApiMethod(
		name = "umlCodePosition.insertOrUpdateCodePositions",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID })
	public List<UmlCodePosition> insertOrUpdateCodePositions(UmlCodePositionList umlCodePositionList, User user) throws UnauthorizedException {

		final List<UmlCodePosition> umlCodePositions = umlCodePositionList.getUmlCodePositions();

		// List is empty
		if (umlCodePositions.size() <= 0) {
			return new ArrayList<>();
		}
		
		UmlCodePosition firstUmlCodePosition = umlCodePositions.get(0);

		// Check if user is authorized
		Authorization.checkAuthorization(firstUmlCodePosition, user);
		
		for (UmlCodePosition umlCodePosition : umlCodePositions) {
			// Check authorization
			if (!umlCodePosition.getCodesystemId().equals(firstUmlCodePosition.getCodesystemId())) {
				throw new IllegalArgumentException("The CodeSystemIds for the codes are not equal. " + firstUmlCodePosition.getCodesystemId() + " / " + umlCodePosition.getCodesystemId());
			}
			
			// Validate
			validateUmlCodePosition(umlCodePosition);
		}
		
		// Persist
		Collection<UmlCodePosition> result;
		
		PersistenceManager mgr = getPersistenceManager();
		try {
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
		if (umlCodePosition.getCodesystemId() == null || umlCodePosition.getCodesystemId() <= 0) {
			throw new IllegalArgumentException("UmlCodePosition codesystemId may not be null or empty");
		}
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

}
	