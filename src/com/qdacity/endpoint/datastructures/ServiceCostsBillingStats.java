package com.qdacity.endpoint.datastructures;

import java.util.Date;
import java.util.Map;

public class ServiceCostsBillingStats {

	private Map<String, Double> serviceCosts;

	public Map<String, Double> getServiceCosts() {
		return serviceCosts;
	}

	public void setServiceCosts(Map<String, Double> serviceCosts) {
		this.serviceCosts = serviceCosts;
	}
}
