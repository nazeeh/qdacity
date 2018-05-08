import {apiMethods} from "../sw";


export default class ResponseHandler {
	constructor() {
	}

	/**
	 *
	 * @param response - The response from the request that should be handled
	 * @param event
	 * @param [dbHandler] - A function that processes the response, e.g. cache it in database.
	 *
	 * @returns {*} Returns the passed response
	 */
	static handleGoodResponse(response, event, dbHandler) {
		if (!response) {
			console.log('[ServiceWorker] No response from fetch ', event.request.url);
			return response;
		}
		const cloned_reponse = response.clone();
		console.log('[ServiceWorker] Good Response from fetch ', event.request.url);
		if (dbHandler !== undefined) {
			caches.match(apiMethods["qdacity.user.getCurrentUser"]).then(function (cache_response) {
				return cache_response.json()
			}).then(function (user) {
				const userId = user.id;
				dbHandler(cloned_reponse.json(), userId)
			});
		}
		return response;
	}

	/**
	 *
	 * @param dbHandler
	 * @param args
	 * @returns {Promise<any>}
	 */
	static handleBadResponse(dbHandler, ...args) {
		console.log('[ServiceWorker] Bad Response from fetch ');
		return caches.match(apiMethods["qdacity.user.getCurrentUser"]).then(function (cache_response) {
			return cache_response.json()
		}).then(function (user) {
			const userId = user.id;
			return dbHandler(userId, args);
		});
	}


}