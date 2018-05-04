import {cache_runtime_name} from "./sw";

function handleGoodResponse(response, event) {
	if (!response) {
		console.log('[ServiceWorker] No response from fetch ', event.request.url);
		return response;
	}
	console.log('[ServiceWorker|POST] Good Response from fetch ', event.request.url);
	return response;
}

/** Definition of Endpoint Handlers **/

export const getCurrentUserHandler = ({url, event}) => {
	caches.open(cache_runtime_name).then(function (cache) {
		return fetch(event.request)
			.then(function (response) {
				const cloned_response = response.clone();
				cloned_response.clone().json().then(body => console.log(body.id));
				cache.put(event.request, cloned_response);
				return response;
			})
			.catch(function () {
				return caches.match(event.request);
			});
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

const listCodeSystemHandler = ({url, event}) => {
	console.log('[ServiceWorker] listCodeSystemHandler called');
	return fetch(event.request)
		.then(function (response) {
			return handleGoodResponse(response);
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

