import { apiMethods, DB_NAME } from "./sw";

function handleGoodResponse(response, event, cacheHandler) {
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
		cacheHandler(cloned_reponse)
	});
	return response;
}



/** Definition of Endpoint Handlers **/

export const listProjectHandler = ({url, event}) => {
	console.log('[ServiceWorker] listProjectHandler');
	return fetch(event.request)
		.then(function (response) {
			return handleGoodResponse(response, event, cacheListProject);
		})
		.catch(function (error) {
			return new Response(JSON.stringify(offlineCode), {});
		});
};

export const insertCodeHandler = ({url, event}) => {
	console.log('[Workbox] insert Code handler called');
	return fetch(event.request)
		.then(function (response) {
			return handleGoodResponse(response, event);
		})
		.catch(function (error) {
			console.warn('[ServiceWorker|Post] Error from fetch: ', error);
			const offlineCode = {
				author: "service worker",
				codesystemID: "1234",
				codeID: "46",
				description: "offline created",
				id: "12345678",
				color: "#000000",
				name: "My first offline code",
				parentID: "1"
			};
			return new Response(JSON.stringify(offlineCode), {});
		});
};

export const getCodeSystemHandler = ({url, event}) => {
	console.log('[ServiceWorker] getCodeSystemHandler called');
	console.log(event);
	//console.log(caches.match(apiMethods["qdacity.user.getCurrentUser"]));
	return fetch(event.request)
		.then(function (response) {
			return handleGoodResponse(response, event);
		})
		.catch(function (error) {
			return new Response(JSON.stringify(offlineCode), {});
		});
};

