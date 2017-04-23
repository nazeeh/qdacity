package com.qdacity.taskboard;

import java.util.HashMap;
import java.util.List;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.datanucleus.query.JDOCursorHelper;
import com.qdacity.Constants;
import com.qdacity.PMF;

@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"))
public class TaskBoardEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 *         persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(
		name = "listTaskBoard")
	public CollectionResponse<TaskBoard> listTaskBoard(@Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit) {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<TaskBoard> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(TaskBoard.class);
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<TaskBoard>) query.execute();
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null) cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (TaskBoard obj : execute);
		} finally {
			mgr.close();
		}

		return CollectionResponse.<TaskBoard> builder().setItems(execute).setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	@ApiMethod(
		name = "getTaskBoard")
	public TaskBoard getTaskBoard(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		TaskBoard taskboard = null;
		try {
			taskboard = mgr.getObjectById(TaskBoard.class, id);

		} finally {
			mgr.close();
		}
		return taskboard;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param taskboard the entity to be inserted.
	 * @return The inserted entity.
	 */
	@ApiMethod(
		name = "insertTaskBoard")
	public TaskBoard insertTaskBoard(TaskBoard taskboard) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (containsTaskBoard(taskboard)) {
				throw new EntityExistsException("Object already exists");
			}
			mgr.makePersistent(taskboard);
		} finally {
			mgr.close();
		}
		return taskboard;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param taskboard the entity to be updated.
	 * @return The updated entity.
	 */
	@ApiMethod(
		name = "updateTaskBoard")
	public TaskBoard updateTaskBoard(TaskBoard taskboard) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsTaskBoard(taskboard)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(taskboard);
		} finally {
			mgr.close();
		}
		return taskboard;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 */
	@ApiMethod(
		name = "removeTaskBoard")
	public void removeTaskBoard(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			TaskBoard taskboard = mgr.getObjectById(TaskBoard.class, id);
			mgr.deletePersistent(taskboard);
		} finally {
			mgr.close();
		}
	}

	private boolean containsTaskBoard(TaskBoard taskboard) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(TaskBoard.class, taskboard.getId());
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
