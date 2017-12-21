package com.qdacity.endpoint;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.logs.*;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import java.util.*;

@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"))
public class EventEndpoint {

	@ApiMethod(
			name = "events.getEvents",
			path = "events"
	)
	public List<Event> getEvents(@Nullable @Named("eventType") EventType eventType, @Named("userId") String userId, @Nullable @Named("startDate") Date startDate, @Named("endDate") Date endDate) {

		StringBuilder filters = new StringBuilder();
		Map<String, Object> parameters = new HashMap<>();

		if(eventType != null) {
			filters.append("eventType == :eventTypeParameter && ");
			parameters.put("eventTypeParameter", eventType);
		}
		if(userId != null) {
			filters.append("userId == :userIdParameter && ");
			parameters.put("userIdParameter", userId);
		}

		startDate = startDate == null ? new Date(0) : startDate;
		endDate = endDate == null ? new Date() : endDate;

		filters.append("datetime >= :startDateParameter && ");
		parameters.put("startDateParameter", startDate);

		filters.append("datetime <= :endDateParameter");
		parameters.put("endDateParameter", endDate);

		Query query = getPersistenceManager().newQuery(Event.class);
		query.setFilter(filters.toString());

		return (List<Event>) query.executeWithMap(parameters);
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

}
