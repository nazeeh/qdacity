package com.qdacity.maintenance.tasks.usermigration;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.endpoint.UserEndpoint;
import com.qdacity.user.User;

public class UserRemovalExecutor implements DeferredTask {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 8856173666444726127L;
	
	private User user;
	private com.google.api.server.spi.auth.common.User executingUser;
	
	public UserRemovalExecutor(User user, com.google.api.server.spi.auth.common.User executingUser) {
		this.user = user;
		this.executingUser = executingUser;
	}

	@Override
	public void run() {
		deleteUser(user);
	}

	private void deleteUser(User user) {
		UserEndpoint userEndpoint = new UserEndpoint();
		try {
			Logger.getLogger("logger").log(Level.INFO, "Trying to delete user: " + user.getId());
			userEndpoint.removeUser(user.getId(), executingUser);
			Logger.getLogger("logger").log(Level.INFO, "Deleted user: " + user.getId());
		} catch (UnauthorizedException e) {
			Logger.getLogger("logger").log(Level.SEVERE, "Could not delete user: " + user.getId());
			e.printStackTrace();
		}
	}

}
