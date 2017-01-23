package com.qdacity.maintenance;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.qdacity.Constants;
import com.qdacity.maintenance.tasks.OrphanDeletion;
import com.qdacity.maintenance.tasks.ValidationCleanup;

@Api(
	name = "qdacity",
	version = "v4",
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"))
public class MaintenanceEndpoint {

	@ApiMethod(
		name = "maintenance.cleanupValidationResults",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public void cleanupValidationResults(com.google.appengine.api.users.User user) throws UnauthorizedException {

		cleanUpValidationResults();

		cleanUpOrphans();

	}

	private void cleanUpValidationResults() {
		ValidationCleanup task = new ValidationCleanup();
		Queue queue = QueueFactory.getDefaultQueue();
		queue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
	}

	private void cleanUpOrphans() {
		OrphanDeletion task = new OrphanDeletion();
		Queue queue = QueueFactory.getDefaultQueue();
		queue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
	}
}
