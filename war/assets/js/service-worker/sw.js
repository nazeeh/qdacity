importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');

import { insertCodeHandler, getCodeSystemHandler } from "./ApiHandler";

const version = 9;
const cache_prefix = "qdacity-app";
const cache_suffix = "v1";
const cache_runtime = "runtime";
const cache_precache = "precache";
export const cache_runtime_name = `${cache_prefix}-${cache_runtime}-${cache_suffix}`;
export const cache_precache_name = `${cache_prefix}-${cache_precache}-${cache_suffix}`;

export let apiMethods = {};

workbox.core.setCacheNameDetails({
	prefix: cache_prefix,
	suffix: cache_suffix,
	precache: cache_precache,
	runtime:cache_runtime
});
// results in runtime cache name: qdacity-app-runtime-v1

function discoverApi() {
	return fetch('_ah/api/discovery/v1/apis/qdacity/$API_VERSION$/rest')
		.then(function (response) {
			if (response.ok) {
				return response.json();
			}
		})
		.then(function (response) {
			return _parseDiscoveryDoc(response);
		})
		.catch(function (error) {
			console.log("error discovery ", error)
		});
}

function _parseDiscoveryDoc(discovery) {
	console.log("parsing discovery...");
	const resources = discovery.resources;
	for (let resource in resources) {
		resource = resources[resource];
		for (let method in resource.methods) {
			method = resource.methods[method];
			apiMethods[method.id] = (discovery.basePath + method.path).replace(/^\/+/g, '');
		}
	}
	registerRoutes();
}

function pathToRegex(path) {
	const regex = new RegExp(path.replace(/{\w+}/g, "\\w+"));
	console.log(regex);
	return regex
}

self.addEventListener('install', function (event) {
	console.log('[ServiceWorker] installing.');
	event.waitUntil(discoverApi());
});


workbox.routing.registerRoute(
	/.*\.css/,
	workbox.strategies.networkFirst()
);
workbox.routing.registerRoute(
	/.*\.js/,
	workbox.strategies.networkFirst()
);
workbox.routing.registerRoute(
	"/",
	workbox.strategies.networkFirst()
);
workbox.routing.registerRoute(
	"/PersonalDashboard",
	workbox.strategies.networkFirst()
);
workbox.routing.registerRoute(
	/ProjectDashboard.*/,
	workbox.strategies.networkFirst()
);
workbox.routing.registerRoute(
	/CodingEditor.*/,
	workbox.strategies.networkFirst()
);
workbox.routing.registerRoute(
	/_ah\/api\/discovery\/.*/,
	workbox.strategies.networkFirst()
);
workbox.routing.registerRoute(
	/_ah\/api\/static\/.*/,
	workbox.strategies.networkFirst()
);



/*** Register Routes ***/
function registerRoutes() {
	workbox.routing.registerRoute(
		"/" + apiMethods["qdacity.user.getCurrentUser"],
		workbox.strategies.networkFirst()
	);
	workbox.routing.registerRoute(
		pathToRegex(apiMethods["qdacity.project.listProject"]),
		getCodeSystemHandler,
	);
	workbox.routing.registerRoute(
		pathToRegex(apiMethods["qdacity.codes.insertCode"]),
		insertCodeHandler,
		'POST'
	);
	workbox.routing.registerRoute(
		pathToRegex(apiMethods["qdacity.codesystem.getCodeSystem"]),
		getCodeSystemHandler,
	);
}
