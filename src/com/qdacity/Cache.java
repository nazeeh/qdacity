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
			try {
				obj = mgr.getObjectById(type, id);
				syncCache.put(keyString, obj);
			} finally {
				mgr.close();
			}
		}

		return obj;
	}
	
	public static void cache(Long id, Class type, Object obj) {
		String keyString = KeyFactory.createKeyString(type.toString(), id);
		MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
		syncCache.put(keyString, obj);
	}

	public static void invalidate(Long id, Class type) {
		String keyString = KeyFactory.createKeyString(type.toString(), id);
		MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();

		syncCache.delete(keyString);

	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}
