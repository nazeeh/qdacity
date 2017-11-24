package com.qdacity.maintenance.tasks.v10tov11Migration;

import java.util.Arrays;
import java.util.List;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.PMF;
import com.qdacity.course.Course;
import com.qdacity.user.LoginProviderType;
import com.qdacity.user.User;
import com.qdacity.user.UserLoginProviderInformation;

public class V10toV11MigrationAuthenticationDatastore implements DeferredTask {

	/**
	 * 
	 */
	private static final long serialVersionUID = -661983430706100860L;

	/**
	 * Adds for each existing user a relation to a UserLoginProviderInformation.
	 * This has the members GOOGLE as provider and the user id as the externalUserId.
	 * 
	 * Precondition: all existing user's id matches the google authentication user id.
	 */
	@Override
	public void run() {
		PersistenceManager mgr = null;
		List<User> execute = null;
		
		try {
			mgr = PMF.get().getPersistenceManager();
			Query q = mgr.newQuery(User.class);
			execute = (List<User>) q.execute();
			
			for(User user: execute) {
				user.addLoginProviderInformation(new UserLoginProviderInformation(LoginProviderType.GOOGLE, user.getId()));
				mgr.makePersistent(user);
			}
		} finally {
			mgr.close();
		}
	}
}
