/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.qdacity.project.metrics.tasks.algorithms;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskHandle;
import com.google.appengine.api.users.User;
import com.qdacity.endpoint.ValidationEndpoint;
import com.qdacity.project.metrics.ValidationResult;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Wrapper for com.google.appengine.api.taskqueue for easier usage in the
 * DeferredEvaluation class.
 *
 * @author ms
 */
public class DeferredAlgorithmTaskQueue {

    private final Queue taskQueue;
    private final List<Future<TaskHandle>> futures;

    public DeferredAlgorithmTaskQueue() {
	taskQueue = QueueFactory.getQueue("ValidationResultQueue");
	futures = new ArrayList<>();
    }

    public Future<TaskHandle> addToTaskQueue(DeferredAlgorithmEvaluation algorithmTask) {
	return taskQueue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(algorithmTask));
    }

    public void launchListInTaskQueue(List<DeferredAlgorithmEvaluation> algorithmTasks) {
	for (DeferredAlgorithmEvaluation algortihmTask : algorithmTasks) {
	    launchInTaskQueue(algortihmTask);
	}
    }

    public void waitForTasksToFinish(int amountValidationProjects, Long validationReportId, User user) throws ExecutionException, UnauthorizedException, InterruptedException {
	Logger.getLogger("logger").log(Level.INFO, "Waiting for tasks: " + futures.size());

	for (Future<TaskHandle> future : futures) {
	    Logger.getLogger("logger").log(Level.INFO, "Is task finished? : " + future.isDone());
	    future.get();
	}
	// Poll every 10 seconds. TODO: find better solution
	List<ValidationResult> valResults = new ArrayList<>();
	while (valResults.size() != amountValidationProjects) {
	    //checking if all validationReports exists. If yes tasks must have finished.
	    ValidationEndpoint ve = new ValidationEndpoint();
	    valResults = ve.listValidationResults(validationReportId, user);
	    Logger.getLogger("logger").log(Level.WARNING, " So many results " + valResults.size() + " for report " + validationReportId + " at time " + System.currentTimeMillis());
	    if (valResults.size() != amountValidationProjects) {
		Thread.sleep(10000);
	    }
	}
	Logger.getLogger("logger").log(Level.INFO, "All Tasks Done for tasks: ");
	Logger.getLogger("logger").log(Level.INFO, "Is task finished? : " + futures.get(0).isDone());
    }

    public void launchInTaskQueue(DeferredAlgorithmEvaluation deferredAlgorithmTask) {
	Future<TaskHandle> future = addToTaskQueue(deferredAlgorithmTask);
	futures.add(future);
    }

}
