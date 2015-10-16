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
public class TextDocumentEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 * @throws UnauthorizedException 
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "documents.listTextDocument",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public CollectionResponse<TextDocument> listTextDocument(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit, User user) throws UnauthorizedException {
		
		throw new UnauthorizedException("User not authorized"); // TODO currently no user is authorized to list all text documents

//		PersistenceManager mgr = null;
//		Cursor cursor = null;
//		List<TextDocument> execute = null;
//
//		try {
//			mgr = getPersistenceManager();
//			Query query = mgr.newQuery(TextDocument.class);
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
//			execute = (List<TextDocument>) query.execute();
//			cursor = JDOCursorHelper.getCursor(execute);
//			if (cursor != null)
//				cursorString = cursor.toWebSafeString();
//
//			// Tight loop for fetching all entities from datastore and accomodate
//			// for lazy fetch.
//			for (TextDocument obj : execute)
//				;
//		} finally {
//			mgr.close();
//		}
//
//		return CollectionResponse.<TextDocument> builder().setItems(execute)
//				.setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws UnauthorizedException 
	 */
	@ApiMethod(name = "documents.getTextDocument",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public CollectionResponse<TextDocument> getTextDocument(@Named("id") Long id, User user) throws UnauthorizedException {
		//Check authorization
		Authorization.checkAuthorization(id, user);
		
		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<TextDocument> execute = null;
		String cursorString = null;
		
		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(TextDocument.class);
			
			query.setFilter( "projectID == :theID");
			Map<String, Long> paramValues = new HashMap();
			paramValues.put("theID", id);
			
			execute = (List<TextDocument>) query.executeWithMap(paramValues);
			
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();
			
			for (TextDocument obj : execute)
				;
		} finally {
			mgr.close();
		}
		return CollectionResponse.<TextDocument> builder().setItems(execute)
				.setNextPageToken(cursorString).build();	
		}
	
//	/**
//	 * This method gets the entity having primary key id. It uses HTTP GET method.
//	 *
//	 * @param id the primary key of the java bean.
//	 * @return The entity with primary key id.
//	 */
//	@ApiMethod(name = "documents.getTextDocument")
//	public TextDocument getTextDocument(@Named("id") Long id) {
//		PersistenceManager mgr = getPersistenceManager();
//		TextDocument textdocument = null;
//		try {
//			textdocument = mgr.getObjectById(TextDocument.class, id);
//		} finally {
//			mgr.close();
//		}
//		return textdocument;
//	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param textdocument the entity to be inserted.
	 * @return The inserted entity.
	 * @throws UnauthorizedException 
	 */
	@ApiMethod(name = "documents.insertTextDocument",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public TextDocument insertTextDocument(TextDocument textdocument, User user) throws UnauthorizedException {
		//Check authorization
		Authorization.checkAuthorization(textdocument, user);
				
		PersistenceManager mgr = getPersistenceManager();
		try {
				if (textdocument.getId() != null && containsTextDocument(textdocument)) {
					throw new EntityExistsException("Object already exists");
				}
			mgr.makePersistent(textdocument);
		} finally {
			mgr.close();
		}
		return textdocument;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param textdocument the entity to be updated.
	 * @return The updated entity.
	 * @throws UnauthorizedException 
	 */
	@ApiMethod(name = "documents.updateTextDocument",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public TextDocument updateTextDocument(TextDocument textdocument, User user) throws UnauthorizedException {
		//Check authorization
		Authorization.checkAuthorization(textdocument, user);
				
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsTextDocument(textdocument)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(textdocument);
		} finally {
			mgr.close();
		}
		return textdocument;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @throws UnauthorizedException 
	 */
	@ApiMethod(name = "documents.removeTextDocument",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public void removeTextDocument(@Named("id") Long id, User user) throws UnauthorizedException {
		PersistenceManager mgr = getPersistenceManager();
		try {
			TextDocument textdocument = mgr.getObjectById(TextDocument.class, id);
			//Check authorization
			Authorization.checkAuthorization(textdocument, user);
			
			mgr.deletePersistent(textdocument);
		} finally {
			mgr.close();
		}
	}

	private boolean containsTextDocument(TextDocument textdocument) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(TextDocument.class, textdocument.getId());
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
