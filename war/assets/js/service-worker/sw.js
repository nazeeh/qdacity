importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');

import { listProjectHandler } from "./handlers/ProjectHandler";


const VERSION = 9;
const CACHE_PREFIX = "qdacity-app";
const CACHE_SUFFIX = "v1";
const CACHE_RUNTIME = "runtime";
const CACHE_PRECACHE = "precache";
export const CACHE_RUNTIME_NAME = `${CACHE_PREFIX}-${CACHE_RUNTIME}-${CACHE_SUFFIX}`;
export const CACHE_PRECACHE_NAME = `${CACHE_PREFIX}-${CACHE_PRECACHE}-${CACHE_SUFFIX}`;
export const DB_NAME = "qdacity-app";

export let apiMethods = {};

workbox.core.setCacheNameDetails({
	prefix: CACHE_PREFIX,
	suffix: CACHE_SUFFIX,
	precache: CACHE_PRECACHE,
	runtime: CACHE_RUNTIME
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
		listProjectHandler,
	);
	/*
	workbox.routing.registerRoute(
		pathToRegex(apiMethods["qdacity.codes.insertCode"]),
		insertCodeHandler,
		'POST'
	);
	workbox.routing.registerRoute(
		pathToRegex(apiMethods["qdacity.codesystem.getCodeSystem"]),
		getCodeSystemHandler,
	);
	*/
}
