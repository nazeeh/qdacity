package com.qdacity.server.project;

import com.qdacity.Constants;
import com.qdacity.server.Authorization;
import com.qdacity.server.PMF;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.api.users.User;
import com.google.appengine.datanucleus.query.JDOCursorHelper;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

@Api(name = "qdacity", namespace = @ApiNamespace(ownerDomain = "qdacity.com", ownerName = "qdacity.com", packagePath = "server.project"))
public class CodeSystemEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 * @param user 
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 * @throws UnauthorizedException 
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "codesystem.listCodeSystem",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public CollectionResponse<CodeSystem> listCodeSystem(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit, User user) throws UnauthorizedException {
		if (user == null) throw new UnauthorizedException("User is Not Valid");
		
		throw new UnauthorizedException("User not authorized"); // TODO currently no user is authorized to list all codesystems
		
//		PersistenceManager mgr = null;
//		Cursor cursor = null;
//		List<CodeSystem> execute = null;
//
//		try {
//			mgr = getPersistenceManager();
//			Query query = mgr.newQuery(CodeSystem.class);
//			if (cursorString != null && cursorString != "") {
//				cursor = Cursor.fromWebSafeString(cursorString);
//				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
//				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
//				query.setExtensions(extensionMap);
//			}
//
//			if (limit != null) {
//				query.setRange(0, limit);
//			}
//
//			execute = (List<CodeSystem>) query.execute();
//			cursor = JDOCursorHelper.getCursor(execute);
//			if (cursor != null)
//				cursorString = cursor.toWebSafeString();
//
//			// Tight loop for fetching all entities from datastore and accomodate
//			// for lazy fetch.
//			for (CodeSystem obj : execute)
//				;
//		} finally {
//			mgr.close();
//		}
//
//		return CollectionResponse.<CodeSystem> builder().setItems(execute)
//				.setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws UnauthorizedException 
	 */
	@ApiMethod(name = "codesystem.getCodeSystem",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public CollectionResponse<Code> getCodeSystem(@Named("id") Long id,
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit,
			User user) throws UnauthorizedException {
		
		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<Code> execute = null;

		try {
			mgr = getPersistenceManager();
			
			// Check if user is Authorized
			Long projectID = CodeSystemEndpoint.getProjectIdFromCodesystem(id);
			Authorization.checkAuthorization(projectID, user);
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

			query.setFilter( "codesytemID == :theID");
			Map<String, Long> paramValues = new HashMap();
			paramValues.put("theID", id);

			execute = (List<Code>) query.executeWithMap(paramValues);
			
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (Code obj : execute)
				;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<Code> builder().setItems(execute)
				.setNextPageToken(cursorString).build();
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
	@ApiMethod(name = "codesystem.insertCodeSystem",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public CodeSystem insertCodeSystem(CodeSystem codesystem, User user) throws UnauthorizedException {
		//Check if user is authorized
		// Authorization.checkAuthorization(codesystem, user); // FIXME only check if user is in DB
		
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (codesystem.getId() != null){
				if (containsCodeSystem(codesystem)) {
					throw new EntityExistsException("Object already exists");
				}
			}
			Code rootCode = new Code();
			rootCode.setName("Code System");
			rootCode.setAuthor("QDAcity");
			rootCode.setColor("#fff");
			mgr.makePersistent(rootCode);
			
			codesystem.addCode(rootCode.getId());
			mgr.makePersistent(codesystem);
			
			rootCode.setCodesytemID(codesystem.getId());
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
	@ApiMethod(name = "codesystem.updateCodeSystem",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public CodeSystem updateCodeSystem(CodeSystem codesystem, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			// Check if user is Authorized
			//Authorization.checkAuthorization(codesystem, user);
			// User is authorized
						
			if (codesystem.getId() != null){
				if (!containsCodeSystem(codesystem)) {
					throw new EntityNotFoundException("Object does not exist");
				}
			}
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
	@ApiMethod(name = "codesystem.removeCodeSystem",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
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
	
	public static Long getProjectIdFromCodesystem(Long id) {
		
		PersistenceManager mgr = null;
		Long projectID = (long) -1;
		try {
			mgr = getPersistenceManager();
			
		Query query = mgr.newQuery(Project.class);
		
		query.setFilter( "codesystemID == :theID");
		Map<String, Long> params = new HashMap();
		params.put("theID", id);
		
		List<Project> projects = (List<Project>) query.executeWithMap(params);
		
		if (projects.size() > 0){
  		Project project = projects.get(0);
  		projectID = project.id;
		}
		else { // Try to find a matching revision
		  query = mgr.newQuery(ProjectRevision.class);
	    
	    query.setFilter( "codesystemID == :theID");
	    
	    List<ProjectRevision> projectRevs = (List<ProjectRevision>) query.executeWithMap(params);
	    ProjectRevision project = projectRevs.get(0);
      projectID = project.getProjectID();
		}
		} finally {
			mgr.close();
		}
		
		return projectID;
	}
	
public static CodeSystem cloneCodeSystem(Long codeSystemId, Long projectId, User user) throws UnauthorizedException {
    
    PersistenceManager mgr = null;
    CodeSystem cloneCodeSystem = null;
    try {
      mgr = getPersistenceManager();
      
      cloneCodeSystem =  new CodeSystem();
      cloneCodeSystem.setProject(projectId);
      cloneCodeSystem = mgr.makePersistent(cloneCodeSystem);
      
      CodeSystemEndpoint cse = new CodeSystemEndpoint();
      Collection<Code> codes = cse.getCodeSystem(codeSystemId, null, null, user).getItems();;
      
      for (Code code : codes) {
        Code cloneCode = new Code();
        cloneCode.setAuthor(code.author);
        cloneCode.setCodesytemID(cloneCodeSystem.getId());
        cloneCode.setColor(code.getColor());
        cloneCode.setMemo(code.getMemo());
        cloneCode.setName(code.getName());
        cloneCode.setParentID(code.getParentID());
        cloneCode.setSubCodesIDs(new ArrayList<Long>(code.getSubCodesIDs()));
        
        mgr.makePersistent(cloneCode);
      }
      
      mgr.makePersistent(cloneCodeSystem);
    } finally {
      mgr.close();
    }
    
    return cloneCodeSystem;
  }


}
