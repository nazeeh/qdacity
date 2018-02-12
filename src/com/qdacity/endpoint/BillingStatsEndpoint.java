package com.qdacity.endpoint;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.appengine.api.datastore.Projection;
import com.google.appengine.api.datastore.PropertyProjection;
import com.google.appengine.api.datastore.Query;
import com.google.cloud.bigquery.*;
import com.qdacity.Constants;
import com.qdacity.authentication.QdacityAuthenticator;
import com.qdacity.endpoint.datastructures.*;
import com.qdacity.logs.EventType;
import com.qdacity.util.DataStoreUtil;

import javax.annotation.Nullable;
import javax.inject.Named;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@Api(
		name = "qdacity",
		version = Constants.VERSION,
		namespace = @ApiNamespace(
			ownerDomain = "qdacity.com",
			ownerName = "qdacity.com",
			packagePath = "server.project"),
		authenticators = {QdacityAuthenticator.class})
public class BillingStatsEndpoint {

	@ApiMethod(
			name = "billing.getAggregatedStats"
	)
	public AggregatedBillingStats getAggregatedStats() throws InterruptedException {

		Calendar calendar = Calendar.getInstance();
		calendar.setTime(new Date());
		calendar.set(Calendar.HOUR_OF_DAY, 0);
		calendar.set(Calendar.MINUTE, 0);
		calendar.set(Calendar.SECOND, 0);
		calendar.set(Calendar.MILLISECOND, 0);
		calendar.add(Calendar.MONTH, -1);
		Date queryStartDate = calendar.getTime();

		Date queryEndDate = new Date();

		double totalCostLastMonth = getTotalCost(queryStartDate, queryEndDate);
		int totalUsersLastMonth = getTotalUsers(queryStartDate, queryEndDate);

		AggregatedBillingStats result = new AggregatedBillingStats();
		result.setCostThisMonth(totalCostLastMonth);
		result.setUsersThisMonth(totalUsersLastMonth);
		result.setCostPerUserThisMonth(totalCostLastMonth / totalUsersLastMonth);

		return result;
	}

	private double getTotalCost(Date queryStartDate, Date queryEndDate) throws InterruptedException {

		BigQuery bigQuery = BigQueryOptions.getDefaultInstance().getService();

		TimeZone timeZone = TimeZone.getTimeZone("UTC");
		DateFormat timestampFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		timestampFormat.setTimeZone(timeZone);

		QueryJobConfiguration queryJobConfiguration = QueryJobConfiguration.newBuilder(
				"SELECT SUM(cost) as cost " +
						"FROM `" + Constants.BILLING_TABLE + "` " +
						"WHERE usage_start_time >= @startTime " +
						"AND usage_start_time < @endTime"
		)
				.addNamedParameter("startTime", QueryParameterValue.string(timestampFormat.format(queryStartDate)))
				.addNamedParameter("endTime", QueryParameterValue.string(timestampFormat.format(queryEndDate)))
				.setUseLegacySql(false)
				.build();


		JobId jobId = JobId.of(UUID.randomUUID().toString());
		Job queryJob = bigQuery.create(JobInfo.newBuilder(queryJobConfiguration).setJobId(jobId).build());

		queryJob = queryJob.waitFor();

		QueryResponse response = bigQuery.getQueryResults(jobId);

		QueryResult queryResult = response.getResult();


		FieldValueList resultRow = queryResult.iterateAll().iterator().next();
		return resultRow.get("cost").getDoubleValue();
	}

	private int getTotalUsers(Date queryStartDate, Date queryEndDate) {

		Query.Filter startDateFilter = new Query.FilterPredicate("lastLogin", Query.FilterOperator.GREATER_THAN, queryStartDate);
		Query.Filter endDateFilter = new Query.FilterPredicate("lastLogin", Query.FilterOperator.LESS_THAN_OR_EQUAL, queryEndDate);
		Query.Filter filter = Query.CompositeFilterOperator.and(startDateFilter, endDateFilter);
		return DataStoreUtil.countEntitiesWithFilter("User", filter);
	}

	@ApiMethod(
			name = "billing.getDailyCosts"
	)
	public DailyCostsBillingStats getDailyCosts(@Nullable @Named("startDate") Date startDate, @Nullable @Named("endDate") Date endDate) throws InterruptedException, ParseException {

		BigQuery bigQuery = BigQueryOptions.getDefaultInstance().getService();

		TimeZone timeZone = TimeZone.getTimeZone("UTC");
		DateFormat timestampFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		timestampFormat.setTimeZone(timeZone);

		Date queryStartDate = startDate != null ? startDate : new Date(0);
		Date queryEndDate = endDate != null ? endDate : new Date();

		QueryJobConfiguration queryJobConfiguration = QueryJobConfiguration.newBuilder(
				"SELECT FORMAT_TIMESTAMP(\"%F\", usage_start_time) as day, SUM(cost) as cost " +
						"FROM `" + Constants.BILLING_TABLE + "` " +
						"WHERE usage_start_time >= @startTime " +
						"AND usage_start_time < @endTime " +
						"GROUP BY day"
		)
				.addNamedParameter("startTime", QueryParameterValue.string(timestampFormat.format(queryStartDate)))
				.addNamedParameter("endTime", QueryParameterValue.string(timestampFormat.format(queryEndDate)))
				.setUseLegacySql(false)
				.build();


		JobId jobId = JobId.of(UUID.randomUUID().toString());
		Job queryJob = bigQuery.create(JobInfo.newBuilder(queryJobConfiguration).setJobId(jobId).build());

		queryJob = queryJob.waitFor();

		QueryResponse response = bigQuery.getQueryResults(jobId);

		QueryResult queryResult = response.getResult();


		Map<Date, Double> resultMap = new HashMap<>();
		DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

		for (FieldValueList row : queryResult.iterateAll()) {
			Date day = dateFormat.parse(row.get("day").getStringValue());
			Double cost = row.get("cost").getDoubleValue();
			resultMap.put(day, cost);
		}
		DailyCostsBillingStats result = new DailyCostsBillingStats();
		result.setDailyCosts(resultMap);

		return result;
	}

	@ApiMethod(name = "billing.getCostsByService")
	public ServiceCostsBillingStats getCostsByService(@Nullable @Named("startDate") Date startDate, @Nullable @Named("endDate") Date endDate) throws InterruptedException {

		BigQuery bigQuery = BigQueryOptions.getDefaultInstance().getService();

		TimeZone timeZone = TimeZone.getTimeZone("UTC");
		DateFormat timestampFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		timestampFormat.setTimeZone(timeZone);

		Date queryStartDate = startDate != null ? startDate : new Date(0);
		Date queryEndDate = endDate != null ? endDate : new Date();

		QueryJobConfiguration queryJobConfiguration = QueryJobConfiguration.newBuilder(
				"SELECT service.description, SUM(cost) as cost " +
						"FROM `" + Constants.BILLING_TABLE + "` " +
						"WHERE usage_start_time >= @startTime " +
						"AND usage_start_time < @endTime " +
						"GROUP BY service.description"
		)
				.addNamedParameter("startTime", QueryParameterValue.string(timestampFormat.format(queryStartDate)))
				.addNamedParameter("endTime", QueryParameterValue.string(timestampFormat.format(queryEndDate)))
				.setUseLegacySql(false)
				.build();


		JobId jobId = JobId.of(UUID.randomUUID().toString());
		Job queryJob = bigQuery.create(JobInfo.newBuilder(queryJobConfiguration).setJobId(jobId).build());

		queryJob = queryJob.waitFor();

		QueryResponse response = bigQuery.getQueryResults(jobId);

		QueryResult queryResult = response.getResult();


		Map<String, Double> resultMap = new HashMap<>();
		for (FieldValueList row : queryResult.iterateAll()) {
			String description = row.get("description").getStringValue();
			Double cost = row.get("cost").getDoubleValue();
			resultMap.put(description, cost);
		}
		ServiceCostsBillingStats result = new ServiceCostsBillingStats();
		result.setServiceCosts(resultMap);

		return result;
	}

	@ApiMethod(
			name = "billing.getExtendedCostsByService"
	)
	public ExtendedServiceCostsBillingStats getExtendedCostsByService(@Nullable @Named("startDate") Date startDate, @Nullable @Named("endDate") Date endDate) throws InterruptedException {

		BigQuery bigQuery = BigQueryOptions.getDefaultInstance().getService();

		TimeZone timeZone = TimeZone.getTimeZone("UTC");
		DateFormat timestampFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		timestampFormat.setTimeZone(timeZone);

		Date queryStartDate = startDate != null ? startDate : new Date(0);
		Date queryEndDate = endDate != null ? endDate : new Date();

		QueryJobConfiguration queryJobConfiguration = QueryJobConfiguration.newBuilder(
				"SELECT service.description as service, sku.description as description, SUM(cost) as cost " +
						"FROM `" + Constants.BILLING_TABLE + "` " +
						"WHERE usage_start_time >= @startTime " +
						"AND usage_start_time < @endTime " +
						"GROUP BY service, description " +
						"ORDER BY cost DESC"
		)
				.addNamedParameter("startTime", QueryParameterValue.string(timestampFormat.format(queryStartDate)))
				.addNamedParameter("endTime", QueryParameterValue.string(timestampFormat.format(queryEndDate)))
				.setUseLegacySql(false)
				.build();


		JobId jobId = JobId.of(UUID.randomUUID().toString());
		Job queryJob = bigQuery.create(JobInfo.newBuilder(queryJobConfiguration).setJobId(jobId).build());

		queryJob = queryJob.waitFor();

		QueryResponse response = bigQuery.getQueryResults(jobId);

		QueryResult queryResult = response.getResult();


		List<ExtendedServiceCostsBillingItem> resultList = new ArrayList<>();
		for (FieldValueList row : queryResult.iterateAll()) {
			ExtendedServiceCostsBillingItem resultItem = new ExtendedServiceCostsBillingItem();

			resultItem.setService(row.get("service").getStringValue());
			resultItem.setDescription(row.get("description").getStringValue());
			resultItem.setCost(row.get("cost").getDoubleValue());

			resultList.add(resultItem);
		}
		ExtendedServiceCostsBillingStats result = new ExtendedServiceCostsBillingStats();
		result.setItems(resultList);

		return result;
	}

}