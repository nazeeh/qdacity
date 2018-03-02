package com.qdacity.endpoint;

import java.util.Date;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.qdacity.Constants;
import com.qdacity.admin.AdminStats;
import com.qdacity.authentication.QdacityAuthenticator;
import com.qdacity.util.DataStoreUtil;

@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"),
	authenticators = {QdacityAuthenticator.class})
public class AdminEndpoint {

	
	@ApiMethod(name = "admin.getAdminStats")
	public AdminStats getAdminStats(User user) throws UnauthorizedException {

		AdminStats statistics = new AdminStats();

		int registeredUsers = DataStoreUtil.countEntities("User");

		Filter activeUserFilter = new FilterPredicate("lastLogin", FilterOperator.GREATER_THAN, (new Date(new Date().getTime() - 2592000000L)));
		int activeUsers = DataStoreUtil.countEntitiesWithFilter("User", activeUserFilter);

		int projects = DataStoreUtil.countEntities("Project");

		statistics.setRegisteredUsers(registeredUsers);
		statistics.setActiveUsers(activeUsers);
		statistics.setProjects(projects);

		return statistics;
	}
	

	
}
