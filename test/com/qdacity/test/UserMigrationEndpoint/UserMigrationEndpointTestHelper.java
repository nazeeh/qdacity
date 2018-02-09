package com.qdacity.test.UserMigrationEndpoint;

import java.util.ArrayList;
import java.util.Date;

import javax.jdo.PersistenceManager;
import javax.persistence.EntityExistsException;

import com.qdacity.PMF;
import com.qdacity.user.User;
import com.qdacity.user.UserType;

public class UserMigrationEndpointTestHelper {
	
	public static User insertOldUser(String userId, String email) {
		User user = new User();
		user.setId(userId);
		user.setEmail(email);
		user.setProjects(new ArrayList<Long>());
		user.setCourses(new ArrayList<Long>());
		user.setType(UserType.USER);
		user.setLastLogin(new Date());
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (user.getId() != null && containsUser(user.getId())) {
				throw new EntityExistsException("Object already exists");
			}
			mgr.makePersistent(user);
		} finally {
			mgr.close();
		}
		return user;
	}
	
	private static boolean containsUser(String id) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(User.class, id);
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			contains = false;
		} finally {
			mgr.close();
		}
		return contains;
	}


	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}
