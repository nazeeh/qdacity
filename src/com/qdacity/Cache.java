package com.qdacity;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;
import com.qdacity.authentication.AuthenticatedUser;
import com.qdacity.endpoint.UserEndpoint;
import com.qdacity.user.User;
import com.qdacity.user.UserLoginProviderInformation;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import java.util.logging.Level;
import java.util.logging.Logger;

public class Cache {

	public static Object get(String id, Class type) {
		Object obj = null;

		String keyString = KeyFactory.createKeyString(type.toString(), id);
		MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();

		if (syncCache.contains(keyString)) {
			obj = syncCache.get(keyString);
		}

		return obj;
	}

	public static Object get(Long id, Class type) {
		Object obj = null;

		String keyString = KeyFactory.createKeyString(type.toString(), id);
		MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();

		if (syncCache.contains(keyString)) {
			obj = syncCache.get(keyString);
		}

		return obj;
	}

	public static Object getOrLoad(Long id, Class type) {
		Object obj = null;

		String keyString = KeyFactory.createKeyString(type.toString(), id);
		MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();

		if (syncCache.contains(keyString)) {
			obj = syncCache.get(keyString);
		} else {
			PersistenceManager mgr = getPersistenceManager();
			try {
				obj = mgr.getObjectById(type, id);
				syncCache.put(keyString, obj);
			} catch (JDOObjectNotFoundException e){
				Logger.getLogger("logger").log(Level.WARNING, "Could not retrieve " + type + " with ID " + id);
			}
			finally {
				mgr.close();
			}
		}

		return obj;
	}
	
	public static Object getOrLoad(String id, Class type) {
		Object obj = null;
		String keyString = KeyFactory.createKeyString(type.toString(), id);
		MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();

		if (syncCache.contains(keyString)) {
			obj = syncCache.get(keyString);
		} else {
			PersistenceManager mgr = getPersistenceManager();
			try {
				
				obj = mgr.getObjectById(type, id);
				syncCache.put(keyString, obj);
			} finally {
				mgr.close();
			}
		}
		return obj;
	}
	
	public static Object getOrLoad(String id, Class type, PersistenceManager mgr) {
		Object obj = null;
		String keyString = KeyFactory.createKeyString(type.toString(), id);
		MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();

		if (syncCache.contains(keyString)) {
			obj = syncCache.get(keyString);
		} else {
			obj = mgr.getObjectById(type, id);
			syncCache.put(keyString, obj);
		}
		return obj;
	}
	

	public static void cache(Long id, Class type, Object obj) {
		String keyString = KeyFactory.createKeyString(type.toString(), id);
		MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
		syncCache.put(keyString, obj);
	}

	public static void cache(String id, Class type, Object obj) {
		String keyString = KeyFactory.createKeyString(type.toString(), id);
		MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
		syncCache.put(keyString, obj);
	}

	public static void invalidate(Long id, Class type) {
		String keyString = KeyFactory.createKeyString(type.toString(), id);
		MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();

		syncCache.delete(keyString);
	}
	
	public static void invalidate(String id, Class type) {
		String keyString = KeyFactory.createKeyString(type.toString(), id);
		MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();

		syncCache.delete(keyString);
	}
	
	public static void cacheAuthenticatedUser(AuthenticatedUser authenticatedUser, User qdacityUser) {
		Class type = User.class;
		String id = getCacheId(authenticatedUser);
		cache(id, type, qdacityUser);
	}

	public static void invalidatUserLogins(User qdacityUser) {
		if(qdacityUser.getLoginProviderInformation() == null) return;
		
		for(UserLoginProviderInformation loginInfo: qdacityUser.getLoginProviderInformation()) {
			invalidate(loginInfo.getProvider().toString() + ":" + loginInfo.getExternalUserId(), User.class);
		}
	}

	private static String getCacheId(AuthenticatedUser authenticatedUser) {
		return authenticatedUser.getProvider().toString() + ":" + authenticatedUser.getId();
	}

	public static User getUserByAuthenticatedUser(AuthenticatedUser authenticatedUser) {
		User user = null;

		String keyString = getCacheId(authenticatedUser);
		MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();

		if (syncCache.contains(keyString)) {
			user = (User) syncCache.get(keyString);
		}
		return user;
	}

	public static User getOrLoadUserByAuthenticatedUser(AuthenticatedUser authenticatedUser) throws UnauthorizedException {
		User user = getUserByAuthenticatedUser(authenticatedUser);

		if(user == null) {
			user = new UserEndpoint().getCurrentUser(authenticatedUser);
			cacheAuthenticatedUser(authenticatedUser, user);
		}

		return user;
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}
