package com.qdacity.project.metrics.tasks.algorithms;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskHandle;
import com.google.appengine.api.users.User;
import com.qdacity.endpoint.ValidationEndpoint;
import com.qdacity.project.metrics.ValidationResult;

/**
 * Wrapper for com.google.appengine.api.taskqueue for easier usage in the
 * DeferredEvaluation class. Only works for DeferredAlgorithmEvaluation Tasks
 *
 */
public class DeferredAlgorithmTaskQueue {

    private final Queue taskQueue;
    private final List<Future<TaskHandle>> futures;
    private long SLEEP_TIME = 10000;

    public DeferredAlgorithmTaskQueue() {
	taskQueue = QueueFactory.getQueue("ValidationResultQueue");
	futures = new ArrayList<>();
    }

    /**
     * Add your Task here and it will be run in the Queue directly
     *
     * @param deferredAlgorithmTask the task you want to run
     */
    public void launchInTaskQueue(DeferredAlgorithmEvaluation deferredAlgorithmTask) {
	Future<TaskHandle> future = addToTaskQueue(deferredAlgorithmTask);
	futures.add(future);
    }

    /**
     * same as launchInTaskQueue, but for lists of tasks
     *
     * @param algorithmTasks the list of your tasks to run
     */
    public void launchListInTaskQueue(List<DeferredAlgorithmEvaluation> algorithmTasks) {
	for (DeferredAlgorithmEvaluation algortihmTask : algorithmTasks) {
	    launchInTaskQueue(algortihmTask);
	}
    }

    /**
     * Waits for all Tasks to finish by polling for their results.
     *
     * @param amountValidationProjects how many tasks are you waiting for
     * @param validationReportId from which validationReport
     * @param user user which has the rights to see the results of the task
     * @return the ValidationResults created by the tasks.
     * @throws ExecutionException
     * @throws UnauthorizedException
     * @throws InterruptedException
     */
    public List<ValidationResult> waitForTasksWhichCreateAnValidationResultToFinish(int amountValidationProjects, Long validationReportId, User user) throws ExecutionException, UnauthorizedException, InterruptedException {
	if (amountValidationProjects == 0) {
	    return null;
	}
	Logger.getLogger("logger").log(Level.INFO, "Waiting for tasks: " + futures.size());

	for (Future<TaskHandle> future : futures) {
	    Logger.getLogger("logger").log(Level.INFO, "Is task finished? : " + future.isDone());
	    future.get();
	}
	// Poll every 10 seconds. TODO: find better solution
	List<ValidationResult> valResults = new ArrayList<>();
		while (valResults.size() != amountValidationProjects || !reportRowsExist(valResults)) {
			// checking if all validationReports exists. If yes tasks must have finished.
			ValidationEndpoint ve = new ValidationEndpoint();
			valResults = ve.listValidationResults(validationReportId, user);
			if (valResults.size() != amountValidationProjects || !reportRowsExist(valResults)) {
				Thread.sleep(SLEEP_TIME);
			}
	}
	Logger.getLogger("logger").log(Level.INFO, "All Tasks Done for tasks: ");
	Logger.getLogger("logger").log(Level.INFO, "Is task finished? : " + futures.get(0).isDone());

	return valResults;

    }

	private boolean reportRowsExist(List<ValidationResult> valResults) {
		for (ValidationResult validationResult : valResults) {
			if (validationResult.getReportRow() == null) {
				Logger.getLogger("logger").log(Level.INFO, " All results as entities in the DB, but the reportRow has not been written for " + validationResult.getId());
				return false;
			}
		}
		return true;
	}

	private Future<TaskHandle> addToTaskQueue(DeferredAlgorithmEvaluation algorithmTask) {
	return taskQueue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(algorithmTask));
    }

}
