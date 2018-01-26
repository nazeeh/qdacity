package com.qdacity.maintenance.tasks.usermigration;

import java.util.Calendar;
import java.util.Date;
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
import com.qdacity.user.UserLoginProviderInformation;

public class InactiveOldUserRemoveCoordinator implements DeferredTask {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 9196803143113204963L;
	
	private int inactiveDays;
	private com.google.api.server.spi.auth.common.User executingUser;
	
	public InactiveOldUserRemoveCoordinator(int inactiveDays, com.google.api.server.spi.auth.common.User executingUser) {
		this.inactiveDays = inactiveDays;
		this.executingUser = executingUser;
	}

	@Override
	public void run() {
		deleteInactiveOldUsers(inactiveDays);
	}

	private void deleteInactiveOldUsers(int inactiveDays) {
		Logger.getLogger("logger").log(Level.INFO, "Starting to delete all old user that were inactive for: " + inactiveDays + "days!");
		
		Calendar calendar = Calendar.getInstance();
		calendar.add(Calendar.DAY_OF_YEAR, -inactiveDays);
		Date thresholdInactiveDate = calendar.getTime();
		
		PersistenceManager mgr = getPersistenceManager();
		try{
			Query query = mgr.newQuery(User.class);
			List<User> allUsers = (List<User>) query.execute();
			
			for(User user: allUsers) {
				List<UserLoginProviderInformation> loginInfos = user.getLoginProviderInformation();
				if(loginInfos == null || loginInfos.size() == 0) {
					// this is an old account
					
					if(user.getLastLogin().before(thresholdInactiveDate)) {
						// also inactive for given days
						UserRemovalExecutor task = new UserRemovalExecutor(user, executingUser);

						Queue queue = QueueFactory.getDefaultQueue();
						queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
					}
				}
			}
		} finally {
			mgr.close();
			Logger.getLogger("logger").log(Level.INFO, "Finished deleting all old user that were inactive for: " + inactiveDays + "days!");
		}
	}



	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}
