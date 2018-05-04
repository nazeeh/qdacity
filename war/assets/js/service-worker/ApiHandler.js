import {cache_runtime_name, apiMethods} from "./sw";
import { Store, get, set } from 'idb-keyval';

function handleGoodResponse(response, event) {
	if (!response) {
		console.log('[ServiceWorker] No response from fetch ', event.request.url);
		return response;
	}
	console.log('[ServiceWorker] Good Response from fetch ', event.request.url);
	return response;
}


/** Definition of Endpoint Handlers **/

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
			console.warn('[ServiceWorker] Error from fetch: ', error);
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

