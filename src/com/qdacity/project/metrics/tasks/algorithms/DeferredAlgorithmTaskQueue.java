package com.qdacity.project.metrics.tasks.algorithms;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskHandle;
import com.qdacity.endpoint.ExerciseEndpoint;
import com.qdacity.endpoint.ValidationEndpoint;
import com.qdacity.project.ProjectType;
import com.qdacity.project.metrics.Result;

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
     * @param reportId from which validationReport
     * @param user user which has the rights to see the results of the task
     * @return the ValidationResults created by the tasks.
     * @throws ExecutionException
     * @throws UnauthorizedException
     * @throws InterruptedException
     */
    public List<? extends Result> waitForTasksWhichCreateAnValidationResultToFinish(int amountValidationProjects, Long reportId, Long exerciseID, User user, ProjectType projectType) throws ExecutionException, UnauthorizedException, InterruptedException {
	if (amountValidationProjects == 0) {
	    return null;
	}
	Logger.getLogger("logger").log(Level.INFO, "Waiting for tasks: " + futures.size());

	for (Future<TaskHandle> future : futures) {
	    Logger.getLogger("logger").log(Level.INFO, "Is task finished? : " + future.isDone());
	    future.get();
	}
	// Poll every 10 seconds. TODO: find better solution
	List<? extends Result> valResults = new ArrayList<>();
		while (valResults.size() != amountValidationProjects || !reportRowsExist(valResults)) {
			// checking if all validationReports exists. If yes tasks must have finished.
            if (projectType == ProjectType.VALIDATION) {
                ValidationEndpoint ve = new ValidationEndpoint();
                valResults = ve.listValidationResults(reportId, user);
            }
            else if (projectType == ProjectType.EXERCISE) {
                ExerciseEndpoint ee = new ExerciseEndpoint();
                valResults = ee.listExerciseResults(reportId, exerciseID, user);
            }
			if (valResults.size() != amountValidationProjects || !reportRowsExist(valResults)) {
				Thread.sleep(SLEEP_TIME);
			}
	}
	Logger.getLogger("logger").log(Level.INFO, "All Tasks Done for tasks: ");
	Logger.getLogger("logger").log(Level.INFO, "Is task finished? : " + futures.get(0).isDone());

	return valResults;

    }

	private boolean reportRowsExist(List<? extends Result> valResults) {
		for (Result result : valResults) {
			if (result.getReportRow() == null) {
				Logger.getLogger("logger").log(Level.INFO, " All results as entities in the DB, but the reportRow has not been written for " + result.getId());
				return false;
			}
		}
		return true;
	}

	private Future<TaskHandle> addToTaskQueue(DeferredAlgorithmEvaluation algorithmTask) {
	return taskQueue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(algorithmTask));
    }

}
