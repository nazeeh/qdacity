package com.qdacity.endpoint;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
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
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query.CompositeFilter;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.datanucleus.query.JDOCursorHelper;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.authentication.QdacityAuthenticator;
import com.qdacity.logs.Change;
import com.qdacity.logs.ChangeObject;
import com.qdacity.logs.ChangeStats;
import com.qdacity.logs.ChangeType;

@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"),
	authenticators = {QdacityAuthenticator.class})
public class ChangeEndpoint {

	UserEndpoint userEndpoint = new UserEndpoint();
	
	/**
	 * This method lists all the entities inserted in datastore. It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities persisted and a cursor to the next page.
	 * @throws UnauthorizedException 
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "changelog.listChange", path = "log")
	public CollectionResponse<Change> listChange(@Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit, User user) throws UnauthorizedException {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<Change> execute = null;
		
		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered

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

			// Set filter
			query.setFilter("userID == :theID");
			Map<String, String> paramValues = new HashMap<String, String>();
			paramValues.put("theID", qdacityUser.getId());

			execute = (List<Change>) query.executeWithMap(paramValues);
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null) cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate for lazy fetch.
			for (Change obj : execute);
		} finally {
			mgr.close();
		}

		return CollectionResponse.<Change> builder().setItems(execute).setNextPageToken(cursorString).build();
	}

	public List<Change> getAllChanges(@Named("projectID") Long projectId) {
	PersistenceManager pmr = getPersistenceManager();
	pmr.setMultithreaded(true);
	Query query = pmr.newQuery(Change.class);

	query.setFilter("projectID == :projectID");
	Map<String, Long> paramValues = new HashMap<>();
	paramValues.put("projectID", projectId);

	List<Change> changes = (List<Change>) query.executeWithMap(paramValues);

	return changes;
	}

	@ApiMethod(name = "changelog.listChangeStats", path = "stats")
	public List<ChangeStats> listChangeStats(@Nullable @Named("period") String period, @Named("filterType") String filterType, @Nullable @Named("projectID") Long projectID, @Nullable @Named("projectType") String projectType, User user) throws UnauthorizedException {

		com.qdacity.user.User qdacityUser = userEndpoint.getCurrentUser(user); // also checks if user is registered
		
		if (filterType.equals("project")) {
			// FIXME authorization for different project types
			// Authorization.checkAuthorization(projectID, user);
		} else if (filterType.equals("user")) {

		} else {
			// bad request
		}

		List<ChangeStats> stats = new ArrayList<ChangeStats>();

		// Set filter
		Filter filter = null;

		if (filterType.equals("project")) {
			Filter projectTypeFilter = new FilterPredicate("projectType", FilterOperator.EQUAL, projectType);
			Filter projectIdFilter = new FilterPredicate("projectID", FilterOperator.EQUAL, projectID);
			filter = new CompositeFilter(CompositeFilterOperator.AND, Arrays.asList(projectIdFilter, projectTypeFilter));
		} else if (filterType.equals("user")) {
			filter = new FilterPredicate("userID", FilterOperator.EQUAL, qdacityUser.getId());
		}

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query("Change").setFilter(filter);

		PreparedQuery pq = datastore.prepare(q);

		Iterable<Entity> dbResult = pq.asIterable();
		Calendar cal = Calendar.getInstance();

		Map<String, Integer> codesCreated = getChangeCount(dbResult, cal, ChangeType.CREATED, ChangeObject.CODE);
		Map<String, Integer> codesDeleted = getChangeCount(dbResult, cal, ChangeType.DELETED, ChangeObject.CODE);
		Map<String, Integer> codesModified = getChangeCount(dbResult, cal, ChangeType.MODIFIED, ChangeObject.CODE);

		for (String key : codesCreated.keySet()) {
			ChangeStats stat = new ChangeStats();
			if (codesCreated.get(key) != null) stat.setCodesCreated(codesCreated.get(key));
			if (codesModified.get(key) != null) stat.setCodesModified(codesModified.get(key));
			if (codesDeleted.get(key) != null) stat.setCodesDeleted(codesDeleted.get(key));
			stat.setLabel(key);
			stats.add(stat);
		}

		return stats;
	}

	private Map<String, Integer> getChangeCount(Iterable<Entity> changes, Calendar cal, ChangeType changeType, ChangeObject changeObject) {
		Map<String, Integer> freq = new HashMap<String, Integer>();

		for (Entity result : changes) {
			if (!result.getProperty("changeType").equals(changeType.toString())) continue;
			if (!result.getProperty("objectType").equals(changeObject.toString())) continue;

			Date date = (Date) result.getProperty("datetime");
			cal.setTime(date);
			int changeWeekNo = cal.get(Calendar.WEEK_OF_YEAR);
			int changeYearNo = cal.get(Calendar.YEAR);
			String weekString = changeYearNo + " W" + changeWeekNo;
			Integer count = freq.get(weekString);
			if (count == null) {
				freq.put(weekString, 1);
			} else {
				freq.put(weekString, count + 1);
			}
		}

		return freq;
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

	@ApiMethod(
			name = "changelog.getChanges",
			path = "changes"
	)
	public List<Change> getChanges(@Nullable @Named("objectType") ChangeObject objectType, @Nullable @Named("changeType") ChangeType changeType, @Nullable @Named("startDate") Date startDate, @Nullable @Named("endDate") Date endDate) {

		StringBuilder filters = new StringBuilder();
		Map<String, Object> parameters = new HashMap<>();

		if(objectType != null) {
			filters.append("objectType == :objectTypeParameter && ");
			parameters.put("objectTypeParameter", objectType);
		}
		if(changeType != null) {
			filters.append("changeType == :changeTypeParameter && ");
			parameters.put("changeTypeParameter", changeType);
		}

		startDate = startDate == null ? new Date(0) : startDate;
		endDate = endDate == null ? new Date() : endDate;

		filters.append("datetime >= :startDateParameter && ");
		parameters.put("startDateParameter", startDate);

		filters.append("datetime <= :endDateParameter");
		parameters.put("endDateParameter", endDate);

		Query query = getPersistenceManager().newQuery(Change.class);
		query.setFilter(filters.toString());

		return (List<Change>) query.executeWithMap(parameters);
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already exists in the datastore, an exception is thrown. It uses HTTP POST method.
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
	 * This method is used for updating an existing entity. If the entity does not exist in the datastore, an exception is thrown. It uses HTTP PUT method.
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
	 * This method removes the entity with primary key id. It uses HTTP DELETE method.
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
