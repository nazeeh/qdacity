package com.qdacity.endpoint;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query.CompositeFilter;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.user.UserNotification;
import com.qdacity.user.UserNotificationType;

@Api(
	name = "qdacity",
	version = "v4",
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"))
public class UserNotificationEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 *         persisted and a cursor to the next page.
	 */
	@ApiMethod(
		name = "user.listUserNotification",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public List<UserNotification> listUserNotification(@Nullable @Named("cursor") String cursorString, @Nullable @Named("limit") Integer limit, com.google.appengine.api.users.User user) {

		Filter userFilter = new FilterPredicate("user", FilterOperator.EQUAL, user.getUserId());

		Date thirtyDaysAgo = new Date(new Date().getTime() - 2592000000L);
		Filter dateFilter = new FilterPredicate("datetime", FilterOperator.GREATER_THAN, thirtyDaysAgo);

		Filter compositeFilter = new CompositeFilter(CompositeFilterOperator.AND, Arrays.asList(dateFilter, userFilter));

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query("UserNotification").setFilter(compositeFilter);

		PreparedQuery pq = datastore.prepare(q);

		List<UserNotification> userNotifications = new ArrayList<UserNotification>();

		for (Entity result : pq.asIterable()) {
			UserNotification userNotification = new UserNotification();
			userNotification.setId(result.getKey().getId());
			userNotification.setDatetime((Date) result.getProperty("datetime"));
			userNotification.setProject((Long) result.getProperty("project"));
			userNotification.setOriginUser((String) result.getProperty("originUser"));
			userNotification.setUser((String) result.getProperty("user"));
			userNotification.setSubject((String) result.getProperty("subject"));
			userNotification.setMessage((String) result.getProperty("message"));
			userNotification.setType(UserNotificationType.valueOf((String) result.getProperty("type")));
			userNotification.setSettled((Boolean) result.getProperty("settled"));

			userNotifications.add(userNotification);
		}

		return userNotifications;

	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	@ApiMethod(
		name = "user.getUserNotification",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public UserNotification getUserNotification(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		UserNotification usernotification = null;
		try {
			usernotification = mgr.getObjectById(UserNotification.class, id);
		} finally {
			mgr.close();
		}
		return usernotification;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param usernotification the entity to be inserted.
	 * @return The inserted entity.
	 */
	@ApiMethod(
		name = "user.insertUserNotification",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public UserNotification insertUserNotification(UserNotification usernotification) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (containsUserNotification(usernotification)) {
				throw new EntityExistsException("Object already exists");
			}
			mgr.makePersistent(usernotification);
		} finally {
			mgr.close();
		}
		return usernotification;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param usernotification the entity to be updated.
	 * @return The updated entity.
	 */
	@ApiMethod(
		name = "user.updateUserNotification",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public UserNotification updateUserNotification(UserNotification usernotification) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsUserNotification(usernotification)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(usernotification);
		} finally {
			mgr.close();
		}
		return usernotification;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 */
	@ApiMethod(
		name = "user.removeUserNotification",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public void removeUserNotification(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			UserNotification usernotification = mgr.getObjectById(UserNotification.class, id);
			mgr.deletePersistent(usernotification);
		} finally {
			mgr.close();
		}
	}

	private boolean containsUserNotification(UserNotification usernotification) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(UserNotification.class, usernotification.getId());
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
