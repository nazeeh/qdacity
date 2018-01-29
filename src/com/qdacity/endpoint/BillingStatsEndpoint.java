package com.qdacity.endpoint;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.cloud.bigquery.*;
import com.qdacity.Constants;
import com.qdacity.endpoint.datastructures.DailyCostsBillingStats;
import com.qdacity.endpoint.datastructures.ServiceCostsBillingStats;

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
				packagePath = "server.project"))
public class BillingStatsEndpoint {

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
		DateFormat dateFormat = new SimpleDateFormat("yyyy-mm-dd");

		for (FieldValueList row : queryResult.iterateAll()) {
			Date day = dateFormat.parse(row.get("day").getStringValue());
			Double cost = row.get("cost").getDoubleValue();
			resultMap.put(day, cost);
		}
		DailyCostsBillingStats result = new DailyCostsBillingStats();
		result.setDailyCosts(resultMap);

		return result;
	}


	@ApiMethod(
			name = "billing.getCostsByService"
	)
	public ServiceCostsBillingStats getCostsByService(@Nullable @Named("startDate") Date startDate, @Nullable @Named("endDate") Date endDate) throws InterruptedException {

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


		Map<String, Double> resultMap = new HashMap<>();
		for (FieldValueList row : queryResult.iterateAll()) {
			String service = row.get("service").getStringValue();
			String description = row.get("description").getStringValue();
			Double cost = row.get("cost").getDoubleValue();
			resultMap.put(service + "." + description, cost);
		}
		ServiceCostsBillingStats result = new ServiceCostsBillingStats();
		result.setServiceCosts(resultMap);

		return result;
	}

}