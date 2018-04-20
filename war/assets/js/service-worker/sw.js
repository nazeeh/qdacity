importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');

import {get, set} from 'idb-keyval';

// TODO replace v14 with version
function fetchDiscoveryDoc() {
	fetch('_ah/api/discovery/v1/apis/qdacity/v14/rest').then(function (response) {
		if (response.ok) {
			return response.json();
		}
	})
		.then(function (response) {
			parseDiscoveryDoc(response);
		}).catch(function (error) {
		console.log("error discovery ", error)

	});
}

function parseDiscoveryDoc(discovery) {
	console.log(discovery);
	const resources = discovery.resources;
	for (let resource in resources) {
		resource = resources[resource];
		for (let method in resource.methods) {
			method = resource.methods[method];
			if (method.httpMethod === "POST") {
				set(method.id, (discovery.basePath + method.path).replace(/^\/+/g, ''));
			}
		}
	}
}

function pathToRegex(path) {
	const regex = new RegExp(path.replace(/{\w+}/g, "\\w+"));
	console.log(regex);
	return regex
}

self.addEventListener('install', function (event) {
	console.log('[ServiceWorker] installing.');
	event.waitUntil(fetchDiscoveryDoc());
});

workbox.routing.registerRoute(
	/^(?!.*ping\.txt$).*/,
	workbox.strategies.networkFirst()
);


const insertProjectHandler = ({url, event}) => {
	console.log('[Workbox] insert Porject handler called');
	return fetch(event.request)
		.then(function (response) {
			if (!response) {
				console.log(
					'[ServiceWorker|POST] No response from fetch ',
					event.request.url
				);
				return response;
			}
			console.log(
				'[ServiceWorker|POST] Good Response from fetch ',
				event.request.url
			);
			console.log(response);

			return response;
		})
		.catch(function (error) {
			console.warn('[ServiceWorker|Post] Error from fetch: ', error);
		});
	//return new Response(`Custom handler response.`);
};

/*** Register Routes ***/

get("qdacity.project.insertProject").then(method =>
	workbox.routing.registerRoute(
		pathToRegex(method),
		insertProjectHandler,
		'POST'
	)
);
