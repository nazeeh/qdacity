import { apiMethods, DB_NAME } from "../sw";
import { Store } from 'idb-keyval';

export default class GoodResponseHandler {
	constructor() {}

	static handleGoodResponse(response, event, dbHandler) {
		if (!response) {
			console.log('[ServiceWorker] No response from fetch ', event.request.url);
			return response;
		}
		const cloned_reponse = response.clone();
		console.log('[ServiceWorker] Good Response from fetch ', event.request.url);
		//console.log(caches.match(apiMethods["qdacity.user.getCurrentUser"]));
		caches.match(apiMethods["qdacity.user.getCurrentUser"]).then(function(cache_response){
			return cache_response.json()
		}).then(function(user){
			const user_id = user.id;
			const store = new Store(DB_NAME, user_id);
			//cloned_reponse.json().then(body => set(key, body, store));
			dbHandler(cloned_reponse, store)
		});
		return response;
	}

}