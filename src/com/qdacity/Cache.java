package com.qdacity;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;

import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;

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
		Object obj;

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

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}
