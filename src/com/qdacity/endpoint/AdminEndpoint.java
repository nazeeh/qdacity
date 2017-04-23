package com.qdacity.endpoint;

import java.util.Date;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.users.User;
import com.qdacity.Constants;
import com.qdacity.admin.AdminStats;

@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"))
public class AdminEndpoint {

	@ApiMethod(
		name = "admin.getAdminStats",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public AdminStats getAdminStats(User user) throws UnauthorizedException {

		AdminStats statistics = new AdminStats();

		int registeredUsers = countEntities("User");

		Filter activeUserFilter = new FilterPredicate("lastLogin", FilterOperator.GREATER_THAN, (new Date(new Date().getTime() - 2592000000L)));
		int activeUsers = countEntitiesWithFilter("User", activeUserFilter);

		int projects = countEntities("Project");

		statistics.setRegisteredUsers(registeredUsers);
		statistics.setActiveUsers(activeUsers);
		statistics.setProjects(projects);

		return statistics;
	}
	
	private int countEntities(String entityName){
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query(entityName).setKeysOnly();
		PreparedQuery pq = datastore.prepare(q);
		return pq.countEntities(FetchOptions.Builder.withDefaults());
	}
	
	private int countEntitiesWithFilter(String entityName, Filter filter) {
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query(entityName).setKeysOnly();
		q.setFilter(filter);
		PreparedQuery pq = datastore.prepare(q);
		return pq.countEntities(FetchOptions.Builder.withDefaults());
	}
	
}
