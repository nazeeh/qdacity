package com.qdacity;

import javax.jdo.PersistenceManager;

import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;

public class Cache {
	public static Object getOrLoad(Long id, Class type) {
		Object obj;

		PersistenceManager mgr = getPersistenceManager();

		String keyString = KeyFactory.createKeyString(type.toString(), id);
		MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();

		if (syncCache.contains(keyString)) {
			obj = syncCache.get(keyString);
		} else {
			obj = mgr.getObjectById(type, id);
		}

		return obj;
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}
