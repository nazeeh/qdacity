package com.qdacity.project.codesystem;

import com.qdacity.Authorization;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.logs.Change;
import com.qdacity.logs.ChangeObject;
import com.qdacity.logs.ChangeType;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.datanucleus.query.JDOCursorHelper;
import com.google.appengine.api.users.User;
















import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

@Api(name = "qdacity", namespace = @ApiNamespace(ownerDomain = "qdacity.com", ownerName = "qdacity.com", packagePath = "server.project"))
public class CodeEndpoint {

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws UnauthorizedException 
	 */
	@ApiMethod(name = "codes.getCode",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
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
	@ApiMethod(name = "codes.insertCode",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID,
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID})

	public Code insertCode(Code code, User user) throws UnauthorizedException {
		//Check if user is authorized
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
			
			//Log change
			CodeSystem cs = mgr.getObjectById(CodeSystem.class, code.getCodesystemID());
			Change change = new Change(new Date(System.currentTimeMillis()),cs.getProject(), cs.getProjectType(),ChangeType.CREATED, user.getUserId(), ChangeObject.CODE, code.getId());
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
	@ApiMethod(name = "codes.updateCode",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public Code updateCode(Code code, User user) throws UnauthorizedException {
		//Check if user is authorized
		Authorization.checkAuthorization(code, user);
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsCode(code)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			Code codeDB = mgr.getObjectById(Code.class, code.getId());
			code.setCodeID(codeDB.getCodeID());
			code.setCodeBookEntry(codeDB.getCodeBookEntry());
			mgr.makePersistent(code);
		} finally {
			mgr.close();
		}
		return code;
	}
	
	@ApiMethod(name = "codes.setCodeBookEntry",  scopes = {Constants.EMAIL_SCOPE},
      clientIds = {Constants.WEB_CLIENT_ID, 
         com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
         audiences = {Constants.WEB_CLIENT_ID})
  public Code setCodeBookEntry(@Named("codeId")  Long codeID, CodeBookEntry entry, User user) throws UnauthorizedException {
    //Fixme Authorization
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

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @throws UnauthorizedException 
	 */
	@ApiMethod(name = "codes.removeCode",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public void removeCode(@Named("id") Long id, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			Code code = mgr.getObjectById(Code.class, id);
			
			//Check if user is authorized
			Authorization.checkAuthorization(code, user);
			mgr.deletePersistent(code.getCodeBookEntry());
			mgr.deletePersistent(code);
		} finally {
			mgr.close();
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
