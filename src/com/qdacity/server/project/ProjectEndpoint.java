package com.qdacity.server.project;

import com.qdacity.server.PMF;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.datanucleus.query.JDOCursorHelper;

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
public class ProjectEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "project.listProject", path="projects")
	public CollectionResponse<Project> listProject(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit) {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<Project> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(Project.class);
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<Project>) query.execute();
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (Project obj : execute)
				;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<Project> builder().setItems(execute)
				.setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	@ApiMethod(name = "project.getProject", path="project")
	public Project getProject(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		Project project = null;
		try {
			project = mgr.getObjectById(Project.class, id);
		} finally {
			mgr.close();
		}
		return project;
	}
	
	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	@ApiMethod(name = "project.incrCodingId", path="codings")
	public Project getAndIncrCodingId(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		Project project = null;
		try {
			project = mgr.getObjectById(Project.class, id);
			++project.maxCodingID;
			mgr.makePersistent(project);
		} finally {
			mgr.close();
		}
		
		return project;
	}
	


	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param project the entity to be inserted.
	 * @return The inserted entity.
	 */
	@ApiMethod(name = "project.insertProject")
	public Project insertProject(Project project) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (containsProject(project)) {
				throw new EntityExistsException("Object already exists");
			}
			mgr.makePersistent(project);
		} finally {
			mgr.close();
		}
		return project;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param project the entity to be updated.
	 * @return The updated entity.
	 */
	@ApiMethod(name = "project.updateProject")
	public Project updateProject(Project project) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsProject(project)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(project);
		} finally {
			mgr.close();
		}
		return project;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 */
	@ApiMethod(name = "project.removeProject")
	public void removeProject(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			Project project = mgr.getObjectById(Project.class, id);
			mgr.deletePersistent(project);
		} finally {
			mgr.close();
		}
	}

	private boolean containsProject(Project project) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(Project.class, project.getId());
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