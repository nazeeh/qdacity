import Promisizer from './Promisizer';

export default class BillingStatsEndpoint {
	constructor() {}

	static getAggregatedStats() {
		let apiMethod = gapi.client.qdacity.billing.getAggregatedStats();
		return Promisizer.makePromise(apiMethod);
	}

	static getDailyCosts(startDate, endDate) {
		let apiMethod = gapi.client.qdacity.billing.getDailyCosts({
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString()
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getCostsByService(startDate, endDate) {
		let apiMethod = gapi.client.qdacity.billing.getCostsByService({
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString()
		});
		return Promisizer.makePromise(apiMethod);
	}

	static getExtendedCostsByService(startDate, endDate) {
		let apiMethod = gapi.client.qdacity.billing.getExtendedCostsByService({
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString()
		});
		return Promisizer.makePromise(apiMethod);
	}
}
