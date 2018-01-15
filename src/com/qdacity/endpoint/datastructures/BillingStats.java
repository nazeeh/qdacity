package com.qdacity.endpoint.datastructures;

import java.util.Date;
import java.util.Map;

public class BillingStats {

	private Map<Date, Double> dailyCosts;

	public Map<Date, Double> getDailyCosts() {
		return dailyCosts;
	}

	public void setDailyCosts(Map<Date, Double> dailyCosts) {
		this.dailyCosts = dailyCosts;
	}
}
