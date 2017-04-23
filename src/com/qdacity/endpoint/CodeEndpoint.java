package com.qdacity.endpoint;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;

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
import com.qdacity.logs.Change;
import com.qdacity.logs.ChangeObject;
import com.qdacity.logs.ChangeType;
import com.qdacity.project.codesystem.Code;
import com.qdacity.project.codesystem.CodeBookEntry;
import com.qdacity.project.codesystem.CodeRelation;
import com.qdacity.project.codesystem.CodeSystem;

@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"))
public class CodeEndpoint {

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(
		name = "codes.getCode",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public Code getCode(@Named("id") Long id, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		Code code = null;
		try {
			code = mgr.getObjectById(Code.class, id);

			// Check if user is authorized
			Authorization.checkAuthorization(code, user);
		} finally {
			mgr.close();
		}
		return code;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param code the entity to be inserted.
	 * @return The inserted entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(
		name = "codes.insertCode",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID })
	public Code insertCode(Code code, User user) throws UnauthorizedException {
		// Check if user is authorized
		Authorization.checkAuthorization(code, user);
		Long codesystemId = code.getCodesystemID();
		Long codeId = CodeSystemEndpoint.getAndIncrCodeId(codesystemId);
		if (code.getSubCodesIDs() == null) code.setSubCodesIDs(new ArrayList<Long>());

		code.setCodeID(codeId);
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (code.getId() != null && containsCode(code)) {
				throw new EntityExistsException("Object already exists");
			}

			if (code.getCodeBookEntry() == null) code.setCodeBookEntry(new CodeBookEntry());

			mgr.makePersistent(code);

			// Log change
			CodeSystem cs = mgr.getObjectById(CodeSystem.class, code.getCodesystemID());
			Change change = new Change(new Date(System.currentTimeMillis()), cs.getProject(), cs.getProjectType(), ChangeType.CREATED, user.getUserId(), ChangeObject.CODE, code.getId());
			mgr.makePersistent(change);

		} finally {
			mgr.close();
		}
		return code;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param code the entity to be updated.
	 * @return The updated entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(
		name = "codes.updateCode",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public Code updateCode(Code code, User user) throws UnauthorizedException {
		// Check if user is authorized
		Authorization.checkAuthorization(code, user);
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsCode(code)) {
				throw new EntityNotFoundException("Object does not exist");
			}

			java.util.logging.Logger.getLogger("logger").log(Level.INFO, " MetaModelElementID " + code.getMmElementID());

			Code codeDB = mgr.getObjectById(Code.class, code.getId());
			code.setCodeID(codeDB.getCodeID());
			code.setCodeBookEntry(codeDB.getCodeBookEntry());
			mgr.makePersistent(code);
		} finally {
			mgr.close();
		}
		return code;
	}

	@ApiMethod(
		name = "codes.setCodeBookEntry",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public Code setCodeBookEntry(@Named("codeId") Long codeID, CodeBookEntry entry, User user) throws UnauthorizedException {
		// Fixme Authorization
		Code code = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			code = mgr.getObjectById(Code.class, codeID);
			Authorization.checkAuthorization(code, user);

			code.setCodeBookEntry(entry);
			mgr.makePersistent(code);
		} finally {
			mgr.close();
		}
		return code;
	}

	@ApiMethod(
		name = "codes.addRelationship",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public Code addRelationship(@Named("sourceCode") Long codeID, CodeRelation realtion, User user) throws UnauthorizedException {
		// Fixme Authorization
		Code code = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			code = mgr.getObjectById(Code.class, codeID);
			Authorization.checkAuthorization(code, user);

			code.addRelation(realtion);
			mgr.makePersistent(code);

			List<CodeRelation> relationships = code.getRelations();
			for (CodeRelation codeRelation : relationships) {
				codeRelation.getCodeId();
			}
		} finally {
			mgr.close();
		}
		return code;
	}

	@ApiMethod(
		name = "codes.removeRelationship",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public Code removeRelationship(@Named("codeId") Long codeID, @Named("relationshipId") Long relationId, User user) throws UnauthorizedException {
		// Fixme Authorization
		Code code = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			code = mgr.getObjectById(Code.class, codeID);
			Authorization.checkAuthorization(code, user);

			code.removeRelation(relationId);
			mgr.makePersistent(code);

			List<CodeRelation> relationships = code.getRelations();
			for (CodeRelation codeRelation : relationships) {
				codeRelation.getCodeId();
			}
		} finally {
			mgr.close();
		}
		return code;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(
		name = "codes.removeCode",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public void removeCode(@Named("id") Long id, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			Code code = mgr.getObjectById(Code.class, id);

			// Check if user is authorized
			Authorization.checkAuthorization(code, user);

			// Delete link from parent code
			Query query = mgr.newQuery(Code.class);

			query.setFilter("codeID == :code && codesystemID == :codesystem");
			Map<String, Long> params = new HashMap<String, Long>();
			params.put("code", code.getParentID());
			params.put("codesystem", code.getCodesystemID());

			@SuppressWarnings("unchecked")
			List<Code> codes = (List<Code>) query.executeWithMap(params);
			if (codes.size() > 0) {
				Code parentCode = codes.get(0);
				parentCode.removeSubCodeID(code.getCodeID());
				mgr.makePersistent(parentCode);
			}

			removeSubCodes(code);

			mgr.deletePersistent(code);

		} finally {
			mgr.close();
		}
	}

	@ApiMethod(
		name = "codes.relocateCode",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public Code relocateCode(@Named("codeId") Long codeID, @Named("newParentID") Long newParentID, User user) throws UnauthorizedException {
		// Fixme Authorization
		Code code = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			code = mgr.getObjectById(Code.class, codeID);
			Authorization.checkAuthorization(code, user);

			Long oldParentID = code.getParentID();
			Code oldParent = getCode(oldParentID, code.getCodesystemID());
			Code newParent = getCode(newParentID, code.getCodesystemID());

			if (oldParent != null) {
				oldParent.removeSubCodeID(code.getCodeID());
				mgr.makePersistent(oldParent);
			}

			newParent.addSubCodeID(code.getCodeID());
			code.setParentID(newParentID);

			mgr.makePersistent(newParent);
			mgr.makePersistent(code);

		} finally {
			mgr.close();
		}
		return code;
	}

	@SuppressWarnings("unchecked")
	private Code getCode(Long codeID, Long Codesystem) {
		Code code = null;

		PersistenceManager mgr = getPersistenceManager();
		try {

			Query query = mgr.newQuery(Code.class);

			query.setFilter("codeID == :code && codesystemID == :codesystem");
			Map<String, Long> params = new HashMap<String, Long>();
			params.put("code", codeID);
			params.put("codesystem", Codesystem);

			List<Code> codeList = ((List<Code>) query.executeWithMap(params));

			if (codeList.size() > 0) code = codeList.get(0);

		} finally {
			mgr.close();
		}
		return code;
	}

	private void removeSubCodes(Code code) {
		List<Long> subcodeIDs = code.getSubCodesIDs();

		if (subcodeIDs.size() > 0) {
			PersistenceManager mgr = getPersistenceManager();

			for (Long subcodeID : subcodeIDs) {
				Query query = mgr.newQuery(Code.class);

				query.setFilter("codeID == :code && codesystemID == :codesystem");
				Map<String, Long> params = new HashMap<String, Long>();
				params.put("code", subcodeID);
				params.put("codesystem", code.getCodesystemID());

				@SuppressWarnings("unchecked")
				Code subcode = ((List<Code>) query.executeWithMap(params)).get(0);

				removeSubCodes(subcode);
				mgr.deletePersistent(subcode);
			}
		}
	}

	private boolean containsCode(Code code) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(Code.class, code.getId());
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
