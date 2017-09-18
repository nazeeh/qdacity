package com.qdacity.course.tasks;

import javax.jdo.PersistenceManager;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.PMF;

public class LastCourseUsed implements DeferredTask {


	/**
	 * 
	 */
	private static final long serialVersionUID = 5803203936020618471L;
	/**
	 * 
	 */

	Long lastCourseId;
	com.qdacity.user.User dbUser;

	public LastCourseUsed(com.qdacity.user.User dbUser, Long lastCourseId) {
		super();
		this.dbUser = dbUser;
		this.lastCourseId = lastCourseId;
	}

	@Override
	public void run() {
		PersistenceManager mgr = getPersistenceManager();
		try {
			dbUser.setLastCourseId(lastCourseId);
			mgr.makePersistent(dbUser);
		} finally {
			mgr.close();
		}

	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}
