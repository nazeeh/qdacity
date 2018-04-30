importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');

const version = 9;

let apiMethods = {};

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
	console.log("parsing discovery");
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


// workbox.routing.registerRoute(
// 	/^(?!.*ping\.txt$).*/,
// 	workbox.strategies.networkFirst()
// );

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
	/_ah\/api\/discovery\/.*/,
	workbox.strategies.networkFirst()
);
workbox.routing.registerRoute(
	/_ah\/api\/static\/.*/,
	workbox.strategies.networkFirst()
);



const insertCodeHandler = ({url, event}) => {
	console.log('[Workbox] insert Code handler called');
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

/*** Register Routes ***/
function registerRoutes() {
	workbox.routing.registerRoute(
		pathToRegex(apiMethods["qdacity.user.getCurrentUser"]),
		workbox.strategies.networkFirst()
	);
	workbox.routing.registerRoute(
		pathToRegex(apiMethods["qdacity.codes.insertCode"]),
		insertCodeHandler,
		'POST'
	);
}
