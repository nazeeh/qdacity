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

@Api(name = "codeendpoint", namespace = @ApiNamespace(ownerDomain = "qdacity.com", ownerName = "qdacity.com", packagePath = "server.project"))
public class CodeEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "listCode")
	public CollectionResponse<Code> listCode(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit) {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<Code> execute = null;

		try {
			mgr = getPersistenceManager();
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

			execute = (List<Code>) query.execute();
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
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	@ApiMethod(name = "getCode")
	public Code getCode(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		Code code = null;
		try {
			code = mgr.getObjectById(Code.class, id);
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
	 */
	@ApiMethod(name = "insertCode")
	public Code insertCode(Code code) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (containsCode(code)) {
				throw new EntityExistsException("Object already exists");
			}
			mgr.makePersistent(code);
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
	 */
	@ApiMethod(name = "updateCode")
	public Code updateCode(Code code) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsCode(code)) {
				throw new EntityNotFoundException("Object does not exist");
			}
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
	 */
	@ApiMethod(name = "removeCode")
	public void removeCode(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			Code code = mgr.getObjectById(Code.class, id);
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
