package com.qdacity.logs;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.qdacity.PMF;
import javax.jdo.PersistenceManager;

public class ChangeLogger {

    private final static boolean DEFERRED = true; //TODO Test//Deferred Change Logging performs better on basic instance

    private static PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
    }

    public static void logChange(Change change) {
	if (DEFERRED) {
	    deferredLog(change);
	} else {
	    directLog(change);
	}
    }

    private static void directLog(Change change) {
	getPersistenceManager().makePersistent(change);
    }

    private static void deferredLog(Change change) {
	DeferredChangeLogger deferredLogging = new DeferredChangeLogger(change);
	Queue queue = QueueFactory.getQueue("ChangeLogQueue");
	queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(deferredLogging));
    }

    private static class DeferredChangeLogger implements DeferredTask {

	private final Change change;

	public DeferredChangeLogger(Change change) {
	    this.change = change;
	}

	@Override
	public void run() {
	    getPersistenceManager().makePersistent(change);
	}

    }

}
