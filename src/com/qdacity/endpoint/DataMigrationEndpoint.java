package com.qdacity.endpoint;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Future;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskHandle;
import com.google.appengine.api.users.User;
import com.qdacity.Constants;
import com.qdacity.maintenance.tasks.v4tov5migration.V4toV5MigrationDocumentResults;
import com.qdacity.maintenance.tasks.v4tov5migration.V4toV5MigrationValidationReports;
import com.qdacity.maintenance.tasks.v4tov5migration.V4toV5MigrationValidationResults;
import com.qdacity.maintenance.tasks.v6tov7Migration.V6toV7MigrationValidationReports;

/**
 * This Endpoint is intented to be used for Data migration when changes in the
 * data model need to be applied in a given dataset. Use this Endpoint with
 * care!
 */
@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"))
public class DataMigrationEndpoint {

    /**
     *
     * @param user Make sure your user has the rights to perform all DataStore
     * Operations! Use with caution!!
     * @throws EntityNotFoundException
     */
    @ApiMethod(
	    name = "migration.migrateV4toV5",
	    scopes = {Constants.EMAIL_SCOPE},
	    clientIds = {Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	    audiences = {Constants.WEB_CLIENT_ID})
    public void migrateV4toV5(User user) throws EntityNotFoundException {
	Queue taskQueue = QueueFactory.getQueue("DataMigrationQueue");
	List<Future<TaskHandle>> futures = new ArrayList<>();
	//assumption: Data only contains ValidationReports that have run an FMeasure!

	V4toV5MigrationValidationReports validationReportMigrationTask = new V4toV5MigrationValidationReports();
	V4toV5MigrationDocumentResults documentResultMigrationTask = new V4toV5MigrationDocumentResults();
	V4toV5MigrationValidationResults validationResultMigrationTask = new V4toV5MigrationValidationResults();

	futures.add(taskQueue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(validationReportMigrationTask)));
	futures.add(taskQueue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(documentResultMigrationTask)));
	futures.add(taskQueue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(validationResultMigrationTask)));

    }

    /**
     * Sets the new evaluationMethod Attribute (all to f-measure)
     * Assumes that there are only fmeasure ValidationReports!
     * @param user for access control
     */
    @ApiMethod(
	    name = "migration.migrateV6toV7",
	    scopes = {Constants.EMAIL_SCOPE},
	    clientIds = {Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	    audiences = {Constants.WEB_CLIENT_ID})
    public void migrateV6toV7(User user) {
	Queue taskQueue = QueueFactory.getQueue("DataMigrationQueue");
	List<Future<TaskHandle>> futures = new ArrayList<>();
	//assumption: Data only contains ValidationReports that have run an FMeasure!
	V6toV7MigrationValidationReports updateTask = new V6toV7MigrationValidationReports();
	
	futures.add(taskQueue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(updateTask)));

    }

}
