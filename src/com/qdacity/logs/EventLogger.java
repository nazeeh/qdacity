package com.qdacity.logs;

import com.google.appengine.api.datastore.*;
import com.qdacity.PMF;

import javax.jdo.PersistenceManager;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

public class EventLogger {

	private static PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
	}

	public static void logDailyUserLogins() {
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(new Date());
		calendar.set(Calendar.HOUR_OF_DAY, 0);
		calendar.set(Calendar.MINUTE, 0);
		calendar.set(Calendar.SECOND, 0);
		calendar.set(Calendar.MILLISECOND, 0);
		calendar.add(Calendar.DATE, -1);
		Date startOfPreviousDay = calendar.getTime();

		Query.Filter loggedInTodayFilter = new Query.FilterPredicate("lastLogin", Query.FilterOperator.GREATER_THAN_OR_EQUAL, startOfPreviousDay);

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query("User");
		q.setFilter(loggedInTodayFilter);
		PreparedQuery pq = datastore.prepare(q);
		Iterable<Entity> entities = pq.asIterable(FetchOptions.Builder.withDefaults());

		List<Event> events = new ArrayList<>();
		for (Entity entity: entities) {
			String userId = entity.getKey().getName();
			events.add(new Event(startOfPreviousDay, EventType.DAILY_USER_LOGIN, userId));
		}

		getPersistenceManager().makePersistentAll(events);
		getPersistenceManager().close();
	}
}
