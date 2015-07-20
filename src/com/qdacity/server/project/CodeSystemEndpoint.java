package com.qdacity.server.project;

import com.qdacity.server.PMF;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.datanucleus.query.JDOCursorHelper;

import java.util.HashMap;
import java.util.List;

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
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "codesystem.listCodeSystem")
	public CollectionResponse<CodeSystem> listCodeSystem(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit) {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<CodeSystem> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(CodeSystem.class);
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<CodeSystem>) query.execute();
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (CodeSystem obj : execute)
				;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<CodeSystem> builder().setItems(execute)
				.setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	@ApiMethod(name = "codesystem.getCodeSystem")
	public CodeSystem getCodeSystem(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		CodeSystem codesystem = null;
		try {
			codesystem = mgr.getObjectById(CodeSystem.class, id);
		} finally {
			mgr.close();
		}
		return codesystem;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param codesystem the entity to be inserted.
	 * @return The inserted entity.
	 */
	@ApiMethod(name = "codesystem.insertCodeSystem")
	public CodeSystem insertCodeSystem(CodeSystem codesystem) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (containsCodeSystem(codesystem)) {
				throw new EntityExistsException("Object already exists");
			}
			mgr.makePersistent(codesystem);
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
	 * @return The updated entity.
	 */
	@ApiMethod(name = "codesystem.updateCodeSystem")
	public CodeSystem updateCodeSystem(CodeSystem codesystem) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsCodeSystem(codesystem)) {
				throw new EntityNotFoundException("Object does not exist");
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
	 */
	@ApiMethod(name = "codesystem.removeCodeSystem")
	public void removeCodeSystem(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			CodeSystem codesystem = mgr.getObjectById(CodeSystem.class, id);
			mgr.deletePersistent(codesystem);
		} finally {
			mgr.close();
		}
	}

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

}