import {apiMethods} from "../sw";


export default class ResponseHandler {
	constructor() {
	}

	/**
	 * To be called when fetch succeded -> There is connection to the backend
	 * Calls the passed function that in most cases stores the values from the good response in the database
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
	 * To be called, when the fetch failed -> could not connect to backend
	 * Calls the passed function that in most cases queries the database and returns the result
	 *
	 * @param dbHandler
	 * @param args - array of arguments that should be passed to the dbHandler(e.g an ID value)
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