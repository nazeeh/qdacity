package com.qdacity.endpoint;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.cloud.bigquery.*;
import com.qdacity.Constants;

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
	public Map<Date, Double> getDailyCosts(@Nullable @Named("startDate") Date startDate, @Nullable @Named("endDate") Date endDate) throws InterruptedException, ParseException {

		BigQuery bigQuery = BigQueryOptions.getDefaultInstance().getService();


		TimeZone timeZone = TimeZone.getTimeZone("UTC");
		DateFormat timestampFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		timestampFormat.setTimeZone(timeZone);

		QueryJobConfiguration queryJobConfiguration = QueryJobConfiguration.newBuilder(
				"SELECT FORMAT_TIMESTAMP(\"%F\", usage_start_time) as day, SUM(cost) as cost " +
						"FROM `" + Constants.BILLING_TABLE + "` " +
						"WHERE usage_start_time >= @startTime " +
						"AND usage_start_time < @endTime " +
						"GROUP BY day"
		)
				.addNamedParameter("table", QueryParameterValue.string("`amse-qdacity.qdacity_amse_billing.gcp_billing_export_v1_005083_BC6F93_4D2352`"))
				.addNamedParameter("startTime", QueryParameterValue.string(timestampFormat.format(startDate)))
				.addNamedParameter("endTime", QueryParameterValue.string(timestampFormat.format(endDate)))
				.setUseLegacySql(false)
				.build();


		JobId jobId = JobId.of(UUID.randomUUID().toString());
		Job queryJob = bigQuery.create(JobInfo.newBuilder(queryJobConfiguration).setJobId(jobId).build());

		queryJob = queryJob.waitFor();

		QueryResponse response = bigQuery.getQueryResults(jobId);

		QueryResult queryResult = response.getResult();


		Map<Date, Double> result = new HashMap<>();
		DateFormat dateFormat = new SimpleDateFormat("yyyy-mm-dd");

		for (FieldValueList row : queryResult.iterateAll()) {
			Date day = dateFormat.parse(row.get("day").getStringValue());
			Double cost = row.get("cost").getDoubleValue();
			result.put(day, cost);
		}

		return result;
	}

}
