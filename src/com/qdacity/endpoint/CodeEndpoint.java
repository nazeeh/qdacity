package com.qdacity.endpoint;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.qdacity.Authorization;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.authentication.QdacityAuthenticator;
import com.qdacity.logs.Change;
import com.qdacity.logs.ChangeBuilder;
import com.qdacity.logs.ChangeLogger;
import com.qdacity.project.codesystem.Code;
import com.qdacity.project.codesystem.CodeBookEntry;
import com.qdacity.project.codesystem.CodeRelation;
import com.qdacity.project.codesystem.CodeSystem;
import com.qdacity.util.DataStoreUtil;

@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"),
	authenticators = {QdacityAuthenticator.class})
public class CodeEndpoint {
	
	private UserEndpoint userEndpoint = new UserEndpoint();

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "codes.getCode")
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
	 * @param relationId specifies the relation if the code is a relationship-code
	 * @return The inserted entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "codes.insertCode")
	public Code insertCode(
			@Named("relationId") @Nullable Long relationId, 
 @Named("relationSourceCodeId") @Nullable Long relationSourceCodeId, @Named("parentId") Long parentID, Code code, User user) throws UnauthorizedException {
		
		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		
		// Check if user is authorized
		Authorization.checkAuthorization(code, user);
		Long codesystemId = code.getCodesystemID();
		Long codeId = CodeSystemEndpoint.getAndIncrCodeId(codesystemId);
		if (code.getSubCodesIDs() == null) code.setSubCodesIDs(new ArrayList<Long>());

		final boolean isRelationshipCode = (relationId != null && relationSourceCodeId != null);
		
		code.setRelations(null);
		code.setCodeID(codeId);
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (code.getId() != null && containsCode(code)) {
				throw new EntityExistsException("Object already exists");
			}

			if (code.getCodeBookEntry() == null) code.setCodeBookEntry(new CodeBookEntry());

			// Create relationship code
			CodeRelation relation = null;
			
			if (isRelationshipCode) {
				// set the relation
				Key relationKey = KeyFactory.createKey(KeyFactory.createKey("Code", relationSourceCodeId), "CodeRelation", relationId);
				relation = mgr.getObjectById(CodeRelation.class, relationKey);
				code.setRelationshipCode(relation);

				// set the MetaModel
				final List<Long> mmElementIds = new ArrayList<>();
				mmElementIds.add(relation.getMmElementId());
				code.setMmElementIDs(mmElementIds);
			}
			
			// Update the parent
			Code parentCode = mgr.getObjectById(Code.class, parentID);
			parentCode.addSubCodeID(code.getCodeID());
			mgr.makePersistent(parentCode);

			// Save the code
			code = mgr.makePersistent(code);

			// Link the code with the relation
			if (isRelationshipCode) {
				relation.setRelationshipCodeId(code.getCodeID());
				relation = mgr.makePersistent(relation);								
			}
			
			// Log change
			 CodeSystem cs = mgr.getObjectById(CodeSystem.class, code.getCodesystemID());
			 Change change = new ChangeBuilder().makeInsertCodeChange(cs.getProject(), cs.getProjectType(), qdacityUser.getId(), code);
			 ChangeLogger.logChange(change);

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
	@ApiMethod(name = "codes.updateCode")
	public Code updateCode(Code code, User user) throws UnauthorizedException {
		
		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		
		// Check if user is authorized
		Authorization.checkAuthorization(code, user);
		
		Code stored = null;
		
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsCode(code)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			
			java.util.logging.Logger.getLogger("logger").log(Level.INFO, " MetaModelElementIDs " + code.getMmElementIDs()); 

			stored = mgr.getObjectById(Code.class, code.getId());
			stored.setAuthor(code.getAuthor());
			stored.setCodesystemID(code.getCodesystemID());
			stored.setColor(code.getColor());
			stored.setMemo(code.getMemo());
			stored.setMmElementIDs(code.getMmElementIDs());
			stored.setName(code.getName());
			stored.setParentID(code.getParentID());
			stored.setSubCodesIDs(code.getSubCodesIDs());
			stored.setRelationshipCode(code.getRelationshipCode());

			stored = mgr.makePersistent(stored);

			//Log change
			CodeSystem cs = mgr.getObjectById(CodeSystem.class, code.getCodesystemID());
			Change change = new ChangeBuilder().makeUpdateCodeChange(stored, code, cs.getProject(), cs.getProjectType(), qdacityUser.getId());
			ChangeLogger.logChange(change);
		} finally {
			mgr.close();
		}
		return stored;
	}

	/**
	 * This method is used for updating an existing relationship-code entity. 
	 * It updates the relationship field of the code and the code-field of the relationship.
	 * 
	 * @param relationshipCodeId the id of the relation-ship code
	 * @param relationSourceId the id of the source-code of the relation
	 * @param relationId the id of the relation
	 * @return The updated entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "codes.updateRelationshipCode")
	public Code updateRelationshipCode(
			@Named("relationshipCodeId") Long relationshipCodeId, 
			@Named("relationSourceId") Long relationSourceId, 
			@Named("relationId") Long relationId,
			User user) throws UnauthorizedException {

		Code code = null;
		PersistenceManager mgr = getPersistenceManager();
		try {	
			// Set the relationship for the relationship-code
			code = getCode(relationshipCodeId, user);
			
			Authorization.checkAuthorization(code, user);
			
			Key relationKey = KeyFactory.createKey(KeyFactory.createKey("Code", relationSourceId), "CodeRelation", relationId);
			CodeRelation relation = mgr.getObjectById(CodeRelation.class, relationKey);
			
			code.setRelationshipCode(relation);
	
			code = mgr.makePersistent(code);
			
			// Save the code in the relationship
			relation.setRelationshipCodeId(code.getCodeID());
			relation = mgr.makePersistent(relation);								
		} finally {
			mgr.close();
		}
		
		return code;
	}
	
	/**
	 * This method is used for updating an existing relationship-code entity. 
	 * It updates the metaModel field of the code and the metaModel of the relation
	 * 
	 * @param relationshipCodeId the id of the relation-ship code
	 * @param newMetaModelId the new metaModel
	 * @return The updated entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "codes.updateRelationshipCodeMetaModel")
	public Code updateRelationshipCodeMetaModel(
			@Named("relationshipCodeId") Long relationshipCodeId, 
			@Named("newMetaModelId") Long newMetaModelId,
			User user) throws UnauthorizedException {

		Code code = null;
		PersistenceManager mgr = getPersistenceManager();
		try {	
			// Update the metaModel of the code
			code = getCode(relationshipCodeId, user);
			
			Authorization.checkAuthorization(code, user);
			
			List<Long> newMetaModelElementIds = new ArrayList<>();
			newMetaModelElementIds.add(newMetaModelId);
			code.setMmElementIDs(newMetaModelElementIds);
	
			code = mgr.makePersistent(code);
			
			// Update the metaModel of the relation
			CodeRelation relation = code.getRelationshipCode();
			if (relation != null) {
				relation.setMmElementId(newMetaModelId);
				relation = mgr.makePersistent(relation);
			}
		} finally {
			mgr.close();
		}
		
		return code;
	}
	
	@ApiMethod(name = "codes.setCodeBookEntry")
	public Code setCodeBookEntry(@Named("codeId") Long codeID, CodeBookEntry entry, User user) throws UnauthorizedException {
		
		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		
		// Fixme Authorization
		Code code = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			code = mgr.getObjectById(Code.class, codeID);
			Authorization.checkAuthorization(code, user);

			CodeBookEntry oldCodeBookEntry = new CodeBookEntry(code.getCodeBookEntry());
			code.setCodeBookEntry(entry);
			mgr.makePersistent(code);
			
			//Log change
			CodeSystem cs = mgr.getObjectById(CodeSystem.class, code.getCodesystemID());
			//this can be a set or an update, the change can cover both
			Change change = new ChangeBuilder().makeUpdateCodeBookEntryChange(oldCodeBookEntry, entry, cs.getProject(), cs.getProjectType(), qdacityUser.getId(), codeID);
			ChangeLogger.logChange(change);
		} finally {
			mgr.close();
		}
		return code;
	}

	@ApiMethod(name = "codes.addRelationship")
	public Code addRelationship(@Named("sourceCode") Long codeID, @Named("createIfItExists") Boolean createIfItExists, CodeRelation relation, User user) throws UnauthorizedException {
		
		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		
		// Fixme Authorization
		Code code = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			code = mgr.getObjectById(Code.class, codeID);
			Authorization.checkAuthorization(code, user);

			// Does the relation exist?
			boolean relationExists = false;
			if (code.getRelations() != null) {
				for (CodeRelation rel : code.getRelations()) {
					if (relation.getCodeId().equals(rel.getCodeId()) &&
						relation.getMmElementId().equals(rel.getMmElementId())) {
						relationExists = true;
						break;
					}
				}
			}
			
			if (createIfItExists || (!createIfItExists && !relationExists)) {
				code.addRelation(relation);
				mgr.makePersistent(code);
	
				List<CodeRelation> relationships = code.getRelations();
				for (CodeRelation codeRelation : relationships) {
					codeRelation.getCodeId();
				}
			}
			
			//Log change
			CodeSystem cs = mgr.getObjectById(CodeSystem.class, code.getCodesystemID());
			Change change = new ChangeBuilder().makeAddRelationShipChange(relation, cs.getProject(), cs.getProjectType(), qdacityUser.getId(), codeID);
			ChangeLogger.logChange(change);
		} finally {
			mgr.close();
		}
		return code;
	}

	@ApiMethod(name = "codes.removeRelationship")
	public Code removeRelationship(@Named("codeId") Long codeID, @Named("relationshipId") Long relationId, User user) throws UnauthorizedException {
		
		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		
		// Fixme Authorization
		Code code = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			code = mgr.getObjectById(Code.class, codeID);
			Authorization.checkAuthorization(code, user);

			Key relationKey = KeyFactory.createKey(KeyFactory.createKey("Code", codeID), "CodeRelation", relationId);
			CodeRelation relation = mgr.getObjectById(CodeRelation.class, relationKey);

			//Log change
			CodeSystem cs = mgr.getObjectById(CodeSystem.class, code.getCodesystemID());
			Change change = new ChangeBuilder().makeRemoveRelationShipChange(relation, cs.getProject(), cs.getProjectType(), qdacityUser.getId(), codeID);
			ChangeLogger.logChange(change);
			
			//Do actual Change
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
	
	@ApiMethod(name = "codes.removeAllRelationships")
	public Code removeAllRelationships(@Named("id") Long id, User user) throws UnauthorizedException {
		Code code = getCode(id, user);
		Code result = code;
		
		for (CodeRelation relation : code.getRelations()) {
			result = removeRelationship(id, relation.getKey().getId(), user);
		}
		
		return result;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "codes.removeCode")
	public void removeCode(@Named("id") Long id, User user) throws UnauthorizedException {
		
		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		
		PersistenceManager mgr = getPersistenceManager();
		try {
			Code code = mgr.getObjectById(Code.class, id);
			if(code==null) { return; }
			// Check if user is authorized
			Authorization.checkAuthorization(code, user);
			
			// Was the code a relationship-code?
			// => clear the relationshipCodeId of the relation
			if (code.getRelationshipCode() != null) {
				Key relationKey = code.getRelationshipCode().getKey();
				CodeRelation relation = mgr.getObjectById(CodeRelation.class, relationKey);
				
				relation.setRelationshipCodeId(null);
		
				mgr.makePersistent(relation);
			}
			
			// Delete link from parent code
			Query query = mgr.newQuery(Code.class);
			
			logRemoveCode(mgr, code, qdacityUser);

			//Actual Delete
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

			removeSubCodes(code, qdacityUser);

			mgr.deletePersistent(code);

		} finally {
			mgr.close();
		}
	}

	private void logRemoveCode(PersistenceManager mgr, Code code, com.qdacity.user.User user) {
	    //Log a code remove change
	    CodeSystem cs = mgr.getObjectById(CodeSystem.class, code.getCodesystemID());
	    Change change = new ChangeBuilder().makeDeleteCodeChange(code, cs.getProject(), cs.getProjectType(), user.getId());
	    ChangeLogger.logChange(change);
	}

	@ApiMethod(name = "codes.relocateCode")
	public Code relocateCode(@Named("codeId") Long codeID, @Named("newParentID") Long newParentID, User user) throws UnauthorizedException {
		
		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		
		// Fixme Authorization
		Code code = null;
		PersistenceManager mgr = getPersistenceManager();
		try {
			code = mgr.getObjectById(Code.class, codeID);
			Authorization.checkAuthorization(code, user);

			Long oldParentID = code.getParentID();
			Code oldParent = getCode(oldParentID, code.getCodesystemID(), mgr);
			Code newParent = getCode(newParentID, code.getCodesystemID(), mgr);

			if (oldParent != null) {
				oldParent.removeSubCodeID(code.getCodeID());
				mgr.makePersistent(oldParent);
			}

			newParent.addSubCodeID(code.getCodeID());
			code.setParentID(newParentID);

			mgr.makePersistent(newParent);
			mgr.makePersistent(code);
			
			//Log change
			CodeSystem cs = mgr.getObjectById(CodeSystem.class, code.getCodesystemID());
			Change change = new ChangeBuilder().makeRelocateCodeChange(code, oldParentID, cs.getProject(), cs.getProjectType(), qdacityUser.getId());
			ChangeLogger.logChange(change);

		} finally {
			mgr.close();
		}
		return code;
	}

	@SuppressWarnings("unchecked")
	private Code getCode(Long codeID, Long Codesystem, PersistenceManager mgr) {
		Code code = null;


		Query query = mgr.newQuery(Code.class);

		query.setFilter("codeID == :code && codesystemID == :codesystem");
		Map<String, Long> params = new HashMap<String, Long>();
		params.put("code", codeID);
		params.put("codesystem", Codesystem);

		List<Code> codeList = ((List<Code>) query.executeWithMap(params));

		if (codeList.size() > 0) code = codeList.get(0);

		return code;
	}

	private void removeSubCodes(Code code, com.qdacity.user.User user) throws UnauthorizedException {
		List<Long> subcodeIDs = code.getSubCodesIDs();

		if (subcodeIDs != null && subcodeIDs.size() > 0) {
			PersistenceManager mgr = getPersistenceManager();
			try {
				for (Long subcodeID : subcodeIDs) {
					Query query = mgr.newQuery(Code.class);

					query.setFilter("codeID == :code && codesystemID == :codesystem");
					Map<String, Long> params = new HashMap<String, Long>();
					params.put("code", subcodeID);
					params.put("codesystem", code.getCodesystemID());

					@SuppressWarnings("unchecked")
					Code subcode = ((List<Code>) query.executeWithMap(params)).get(0);

					removeSubCodes(subcode, user);

					logRemoveCode(mgr, subcode, user);

					mgr.deletePersistent(subcode);
				}
			} finally {
				mgr.close();
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
	
	public static int countCodes(Long codesystemID) {
	    com.google.appengine.api.datastore.Query.Filter filter = new com.google.appengine.api.datastore.Query.FilterPredicate("codesystemID", com.google.appengine.api.datastore.Query.FilterOperator.EQUAL, codesystemID);
	    return DataStoreUtil.countEntitiesWithFilter("Code", filter);
	}

}
