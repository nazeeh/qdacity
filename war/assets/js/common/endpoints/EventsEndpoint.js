import Promisizer from './Promisizer';

export default class EventsEndpoint {
	constructor() {}

	static getEvents(eventType, userId, startDate, endDate) {
		let apiMethod = gapi.client.qdacity.events.getEvents({
			eventType: eventType,
			userId: userId,
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString()
		});
		return Promisizer.makePromise(apiMethod);
	}
}
