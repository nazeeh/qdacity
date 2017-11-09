package com.qdacity.endpoint;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.datanucleus.query.JDOCursorHelper;
import com.qdacity.Authorization;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.authentication.FirebaseAuthenticator;
import com.qdacity.project.ProjectType;
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
		packagePath = "server.project"),
	authenticators = {FirebaseAuthenticator.class})
public class CodeSystemEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 * 
	 * @param user
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 *         persisted and a cursor to the next page.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "codesystem.listCodeSystem")
	public CollectionResponse<CodeSystem> listCodeSystem(@Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit, User user) throws UnauthorizedException {
		if (user == null) throw new UnauthorizedException("User is Not Valid");

		throw new UnauthorizedException("User not authorized"); // TODO currently no user is authorized to list all codesystems

	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws UnauthorizedException
	 */
	@SuppressWarnings("unchecked")
	@ApiMethod(name = "codesystem.getCodeSystem")
	public CollectionResponse<Code> getCodeSystem(@Named("id") Long id, @Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit, User user) throws UnauthorizedException {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<Code> execute = null;

		try {
			mgr = getPersistenceManager();

			// Check if user is Authorized
			// Long projectID = CodeSystemEndpoint.getProjectIdFromCodesystem(id);
			// Authorization.checkAuthorization(projectID, user); // FIXME add authorization for codesystem (could be associated to different types of projects)

			// User is authorized

			Query query = mgr.newQuery(Code.class);
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			query.setFilter("codesystemID == :theID");
			Map<String, Long> paramValues = new HashMap<String, Long>();
			paramValues.put("theID", id);

			execute = (List<Code>) query.executeWithMap(paramValues);

			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null) cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (Code obj : execute) {
				obj.getCodeBookEntry().getDefinition();
				List<CodeRelation> relations = obj.getRelations();
				if (relations != null) {
					for (CodeRelation codeRelation : relations) {
						codeRelation.getCodeId();
					}
				}

			}

		} finally {
			mgr.close();
		}

		return CollectionResponse.<Code> builder().setItems(execute).setNextPageToken(cursorString).build();
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param codesystem the entity to be inserted.
	 * @param user
	 * @return The inserted entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "codesystem.insertCodeSystem")
	public CodeSystem insertCodeSystem(CodeSystem codesystem, User user) throws UnauthorizedException {
		// Check if user is authorized
		// Authorization.checkAuthorization(codesystem, user); // FIXME only check if user is in DB

		PersistenceManager mgr = getPersistenceManager();
		try {
			if (codesystem.getId() != null) {
				if (containsCodeSystem(codesystem)) {
					throw new EntityExistsException("Object already exists");
				}
			}
			Code rootCode = new Code();
			rootCode.setName("Code System");
			rootCode.setAuthor("QDAcity");
			rootCode.setColor("#000");
			rootCode.setCodeID(1L);
			rootCode.setSubCodesIDs(new ArrayList<Long>());
			rootCode.setCodeBookEntry(new CodeBookEntry());
			mgr.makePersistent(rootCode);

			codesystem.addCode(rootCode.getId());
			codesystem.setMaxCodeID(1L);
			mgr.makePersistent(codesystem);

			rootCode.setCodesystemID(codesystem.getId());
			mgr.makePersistent(rootCode);

		} finally {
			mgr.close();
		}
		return codesystem;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param codesystem the entity to be updated.
	 * @param user
	 * @return The updated entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "codesystem.updateCodeSystem")
	public CodeSystem updateCodeSystem(CodeSystem codesystem, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			// Check if user is Authorized
			// Authorization.checkAuthorization(codesystem, user);
			// User is authorized

			if (codesystem.getId() != null) {
				if (!containsCodeSystem(codesystem)) {
					throw new EntityNotFoundException("Object does not exist");
				}
			}
			CodeSystem codeSystemDB = mgr.getObjectById(CodeSystem.class, codesystem.getId());
			codesystem.setMaxCodeID(codeSystemDB.getMaxCodeID());
			mgr.makePersistent(codesystem);
		} finally {
			mgr.close();
		}
		return codesystem;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "codesystem.removeCodeSystem")
	public void removeCodeSystem(@Named("id") Long id, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			CodeSystem codesystem = mgr.getObjectById(CodeSystem.class, id);

			// Check if user is authorized
			Authorization.checkAuthorization(codesystem, user);

			mgr.deletePersistent(codesystem);
		} finally {
			mgr.close();
		}
	}

	public static Long getAndIncrCodeId(@Named("id") Long id) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		CodeSystem codesystem = null;
		try {
			codesystem = mgr.getObjectById(CodeSystem.class, id);
			codesystem.setMaxCodeID(codesystem.getMaxCodeID() + 1);
			// ++codesystem.maxCodeID;
			mgr.makePersistent(codesystem);
		} finally {
			mgr.close();
		}

		return codesystem.getMaxCodeID();
	}

	//
	// Helper functions
	//

	private boolean containsCodeSystem(CodeSystem codesystem) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(CodeSystem.class, codesystem.getId());
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

	public static CodeSystem cloneCodeSystem(Long codeSystemId, Long projectId, ProjectType prjType, User user) throws UnauthorizedException {

		PersistenceManager mgr = null;
		CodeSystem cloneCodeSystem = null;
		try {
			mgr = getPersistenceManager();

			CodeSystem codeSystem = mgr.getObjectById(CodeSystem.class, codeSystemId);

			cloneCodeSystem = new CodeSystem();
			cloneCodeSystem.setProject(projectId);
			cloneCodeSystem.setMaxCodeID(codeSystem.getMaxCodeID());
			cloneCodeSystem.setProjectType(prjType);
			cloneCodeSystem = mgr.makePersistent(cloneCodeSystem);

			CodeSystemEndpoint cse = new CodeSystemEndpoint();
			Collection<Code> codes = cse.getCodeSystem(codeSystemId, null, null, user).getItems();;

			for (Code code : codes) {
				Code cloneCode = new Code();
				cloneCode.setCodeID(code.getCodeID());
				cloneCode.setAuthor(code.getAuthor());
				cloneCode.setCodesystemID(cloneCodeSystem.getId());
				cloneCode.setColor(code.getColor());
				cloneCode.setMemo(code.getMemo());
				cloneCode.setName(code.getName());
				cloneCode.setParentID(code.getParentID());
				cloneCode.setSubCodesIDs(code.getSubCodesIDs());
				cloneCode.setCodeBookEntry(code.getCodeBookEntry());

				mgr.makePersistent(cloneCode);
			}

			mgr.makePersistent(cloneCodeSystem);
		} finally {
			mgr.close();
		}

		return cloneCodeSystem;
	}

	public static CodeSystem setProject(Long codeSystemId, Long projectId) throws UnauthorizedException {

		PersistenceManager mgr = null;
		CodeSystem codeSystem = null;
		try {
			mgr = getPersistenceManager();

			codeSystem = mgr.getObjectById(CodeSystem.class, codeSystemId);
			codeSystem.setProject(projectId);
			mgr.makePersistent(codeSystem);

		} finally {
			mgr.close();
		}

		return codeSystem;
	}
	
    /**
     * Gets the code Ids (not DB Keys!) from the codesystem as List
     *
     * @param codesystemId which Codesystem ID
     * @param user The user who performs the operation
     * @return A list of Code IDs (not DB Keys!)
     * @throws UnauthorizedException if user is not authorized to use this
     * codesystem
     */
    public static Map<String, Long> getCodeNamesAndIds(Long codesystemId, User user) throws UnauthorizedException {
	CodeSystemEndpoint cse = new CodeSystemEndpoint();
	CollectionResponse<Code> codes = cse.getCodeSystem(codesystemId, null, null, user);
	Map<String, Long> codeIds = new HashMap<>();
	for (Code code : codes.getItems()) {
	    //IMPORTANT: Using CodeId (Actual Code Id) and NOT id (Database Key)
	    codeIds.put(code.getName(), code.getCodeID());
	}
	return codeIds;
    }

}
