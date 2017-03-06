package com.qdacity.project.tasks;

import javax.jdo.PersistenceManager;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.PMF;
import com.qdacity.project.ProjectType;

public class LastProjectUsed implements DeferredTask {


	/**
	 * 
	 */
	private static final long serialVersionUID = -8667905305036078596L;

	Long lastProjectId;
	ProjectType lastProjectType;
	com.qdacity.user.User dbUser;

	public LastProjectUsed(com.qdacity.user.User dbUser, Long lastProjectId, ProjectType lastProjectType) {
		super();
		this.dbUser = dbUser;
		this.lastProjectId = lastProjectId;
		this.lastProjectType = lastProjectType;
	}

	@Override
	public void run() {
		PersistenceManager mgr = getPersistenceManager();
		try {
			dbUser.setLastProjectId(lastProjectId);
			dbUser.setLastProjectType(lastProjectType);
			mgr.makePersistent(dbUser);
		} finally {
			mgr.close();
		}

	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}
