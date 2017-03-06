package com.qdacity.project.tasks;

import javax.jdo.PersistenceManager;

import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.PMF;
import com.qdacity.project.Project;
import com.qdacity.project.ProjectRevision;
import com.qdacity.project.ProjectType;
import com.qdacity.project.ValidationProject;

public class ProjectDataPreloader implements DeferredTask {


	/**
	 * 
	 */
	private static final long serialVersionUID = 3549571981011962989L;

	Long projectId;
	ProjectType projectType;
	com.qdacity.user.User dbUser;

	public ProjectDataPreloader(Long projectId, ProjectType projectType) {
		super();
		this.projectId = projectId;
		this.projectType = projectType;
	}

	@Override
	public void run() {
		
		PersistenceManager mgr = getPersistenceManager();
		try {
			MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
			String keyString;
			switch (projectType) {
				case PROJECT:
					keyString = KeyFactory.createKeyString(Project.class.toString(), projectId);
					if (!syncCache.contains(keyString)) {
						Project prj = mgr.getObjectById(Project.class, projectId);
						syncCache.put(keyString, prj);
					}
					break;
				case REVISION:
					keyString = KeyFactory.createKeyString(ProjectRevision.class.toString(), projectId);
					if (!syncCache.contains(keyString)) {
						ProjectRevision prj = mgr.getObjectById(ProjectRevision.class, projectId);
						syncCache.put(keyString, prj);
					}
					break;
				case VALIDATION:
					keyString = KeyFactory.createKeyString(ValidationProject.class.toString(), projectId);
					if (!syncCache.contains(keyString)) {
						ValidationProject prj = mgr.getObjectById(ValidationProject.class, projectId);
						syncCache.put(keyString, prj);
					}
					break;

				default:
					break;
			}

		} finally {
			mgr.close();
		}

	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}
