package com.qdacity.logs;

import com.google.appengine.api.datastore.Query;
import com.qdacity.PMF;
import com.qdacity.util.DataStoreUtil;

import javax.jdo.PersistenceManager;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;

public class EventLogger {

	private static PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
	}

	public static void logDailyUserLogin(String userId) {
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(new Date());
		calendar.set(Calendar.HOUR_OF_DAY, 0);
		calendar.set(Calendar.MINUTE, 0);
		calendar.set(Calendar.SECOND, 0);
		calendar.set(Calendar.MILLISECOND, 0);
		Date startOfDay = calendar.getTime();

		Query.Filter userIdFilter = new Query.FilterPredicate("userId", Query.FilterOperator.EQUAL, userId);
		Query.Filter datetimeFilter = new Query.FilterPredicate("datetime", Query.FilterOperator.EQUAL, startOfDay);
		Query.Filter filter = new Query.CompositeFilter(Query.CompositeFilterOperator.AND, Arrays.asList(userIdFilter, datetimeFilter));
		final int existingEvents = DataStoreUtil.countEntitiesWithFilter("Event", filter);

		if(existingEvents == 0) {
			PersistenceManager mgr = getPersistenceManager();
			try {
				Event loginEvent = new Event(startOfDay, EventType.DAILY_USER_LOGIN, userId);
				mgr.makePersistent(loginEvent);
			} finally {
				mgr.close();
			}
		}
	}

}
