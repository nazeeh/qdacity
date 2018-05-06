import { apiMethods } from "../sw";


export default class ResponseHandler {
	constructor() {
	}

	static handleGoodResponse(response, event, dbHandler) {
		if (!response) {
			console.log('[ServiceWorker] No response from fetch ', event.request.url);
			return response;
		}
		const cloned_reponse = response.clone();
		console.log('[ServiceWorker] Good Response from fetch ', event.request.url);
		caches.match(apiMethods["qdacity.user.getCurrentUser"]).then(function (cache_response) {
			return cache_response.json()
		}).then(function (user) {
			const userId = user.id;
			dbHandler(cloned_reponse.json(), userId)
		});
		return response;
	}

	static handleBadResponse(dbHandler) {
		console.log('[ServiceWorker] Bad Response from fetch ');
		return caches.match(apiMethods["qdacity.user.getCurrentUser"]).then(function (cache_response) {
			return cache_response.json()
		}).then(function (user) {
			const userId = user.id;
			var pro = dbHandler(userId)
			console.log("in handbadresponse,return ", pro);
			return pro;
		});
	}


}