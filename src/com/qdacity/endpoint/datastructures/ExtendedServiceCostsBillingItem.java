package com.qdacity.endpoint.datastructures;

public class ExtendedServiceCostsBillingItem {

	private String service;
	private String description;
	private Double cost;

	public String getService() {
		return service;
	}

	public void setService(String service) {
		this.service = service;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Double getCost() {
		return cost;
	}

	public void setCost(Double cost) {
		this.cost = cost;
	}
}
