package com.qdacity.maintenance.tasks.usermigration;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.qdacity.PMF;
import com.qdacity.user.User;

public class UserMigrationEmailNotifier implements DeferredTask {

	private String href;
	
	/**
	 * Sends emails to all users with the migration site link inside.
	 * @param href to the migration site.
	 */
	public UserMigrationEmailNotifier(String href) {
		this.href = href;
	}
	
	@Override
	public void run() {
		notifyAllUsersPerEmail(href);
	}

	@SuppressWarnings("unchecked")
	private void notifyAllUsersPerEmail(String href) {
		PersistenceManager mgr = getPersistenceManager();
		
		try {
			Query query = mgr.newQuery(User.class);
			List<User> userList = (List<User>) query.execute();
			
			Logger.getLogger("logger").log(Level.INFO, "Starting sending user migration emails to all " + userList.size() + " users.");
			for(User user: userList) {
				UserMigrationEmailSender task = new UserMigrationEmailSender(user, href);

				Queue queue = QueueFactory.getDefaultQueue();
				queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
			}
			Logger.getLogger("logger").log(Level.INFO, "Finished sending user migration emails to all users.");
		} finally {
			mgr.close();
		}
	}


	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
    }
}
