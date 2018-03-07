package com.qdacity.endpoint.datastructures;

public class AggregatedBillingStats {

	private double costThisMonth;
	private int usersThisMonth;
	private double costPerUserThisMonth;

	public double getCostThisMonth() {
		return costThisMonth;
	}

	public void setCostThisMonth(double costThisMonth) {
		this.costThisMonth = costThisMonth;
	}

	public int getUsersThisMonth() {
		return usersThisMonth;
	}

	public void setUsersThisMonth(int usersThisMonth) {
		this.usersThisMonth = usersThisMonth;
	}

	public double getCostPerUserThisMonth() {
		return costPerUserThisMonth;
	}

	public void setCostPerUserThisMonth(double costPerUserThisMonth) {
		this.costPerUserThisMonth = costPerUserThisMonth;
	}
}
