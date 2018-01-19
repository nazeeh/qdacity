import Promisizer from './Promisizer';

export default class BillingStatsEndpoint {
	constructor() {}

	static getDailyCosts(startDate, endDate) {
		let apiMethod = gapi.client.qdacity.billing.getDailyCosts({
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString()
		});
		return Promisizer.makePromise(apiMethod);
	}
}
