package com.qdacity.server.logs;

import com.qdacity.Constants;
import com.qdacity.server.PMF;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.users.User;
import com.google.appengine.datanucleus.query.JDOCursorHelper;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
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
public class ChangeEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "changelog.listChange", path="log",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public CollectionResponse<Change> listChange(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit, User user) {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<Change> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(Change.class);
			
			
			
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			//Set filter
			query.setFilter( "userID == :theID");
			Map<String, String> paramValues = new  HashMap<String, String>();
			paramValues.put("theID", user.getUserId());

			execute = (List<Change>) query.executeWithMap(paramValues);
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (Change obj : execute)
				;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<Change> builder().setItems(execute)
				.setNextPageToken(cursorString).build();
	}
	
	
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "changelog.listChangeStats", path="stats",  scopes = {Constants.EMAIL_SCOPE},
			clientIds = {Constants.WEB_CLIENT_ID, 
		     com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
		     audiences = {Constants.WEB_CLIENT_ID})
	public List<ChangeStats> listChangeStats(
			@Nullable @Named("period") String period, User user) {

		Cursor cursor = null;
		List<Change> execute = null;
		String cursorString = null;
		
		List<ChangeStats> stats = new ArrayList<ChangeStats>();

		//Set filter
		Filter userFilter = new FilterPredicate("userID", FilterOperator.EQUAL, user.getUserId());

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query("Change").setFilter(userFilter);

		PreparedQuery pq = datastore.prepare(q);
		
		Calendar cal = Calendar.getInstance();
		
		Map<String, Integer> freq = new HashMap<String, Integer>();

		
		
		for (Entity result : pq.asIterable()) {
			Date date = (Date) result.getProperty("datetime");
			cal.setTime(date);
			int changeWeekNo = cal.get(Calendar.WEEK_OF_YEAR);
			int changeYearNo = cal.get(Calendar.YEAR);
			String weekString = changeYearNo+ " W" + changeWeekNo;
			Integer count = freq.get(weekString);
			if (count == null) {
			    freq.put(weekString, 1);
			}
			else {
			    freq.put(weekString, count + 1);
			}
		}
		
		for (String key : freq.keySet()) {
			ChangeStats stat = new ChangeStats();
			stat.setCodesCreated(freq.get(key));
			stat.setLabel(key);
			stats.add(stat);
		}
		
		
		return stats;
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	@ApiMethod(name = "changelog.getChange")
	public Change getChange(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		Change change = null;
		try {
			change = mgr.getObjectById(Change.class, id);
		} finally {
			mgr.close();
		}
		return change;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param change the entity to be inserted.
	 * @return The inserted entity.
	 */
	@ApiMethod(name = "changelog.insertChange")
	public Change insertChange(Change change) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (containsChange(change)) {
				throw new EntityExistsException("Object already exists");
			}
			mgr.makePersistent(change);
		} finally {
			mgr.close();
		}
		return change;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param change the entity to be updated.
	 * @return The updated entity.
	 */
	@ApiMethod(name = "changelog.updateChange")
	public Change updateChange(Change change) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsChange(change)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(change);
		} finally {
			mgr.close();
		}
		return change;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 */
	@ApiMethod(name = "changelog.removeChange")
	public void removeChange(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			Change change = mgr.getObjectById(Change.class, id);
			mgr.deletePersistent(change);
		} finally {
			mgr.close();
		}
	}

	private boolean containsChange(Change change) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(Change.class, change.getId());
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
