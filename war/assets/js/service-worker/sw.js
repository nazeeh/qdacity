importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');

const version=2;

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
	console.log(discovery);
	const resources = discovery.resources;
	for (let resource in resources) {
		resource = resources[resource];
		for (let method in resource.methods) {
			method = resource.methods[method];
			if (method.httpMethod === "POST") {
				apiMethods[method.id] = (discovery.basePath + method.path).replace(/^\/+/g, '');
			}
		}
	}
	registerPostRoutes();
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
	const testProject = {
		codesystemID: "1234",
		description: "offline created",
		id: "12345678",
		maxCodingID: "0",
		name: "My first offline projekt",
		revision: 0,
		type: "PROJECT"
	};
	return new Response(JSON.stringify(testProject));
};

const insertCourseHandler = ({url, event}) => {
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
	const testCourse = {
		description: "offline created course",
		id: "12345678",
		maxCodingID: "0",
		name: "My first offline course",
	};
	return new Response(JSON.stringify(testCourse));
};

const defaultRejectPostHandler = ({url, event}) => {
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
			response.clone().json().then(body => console.log(body));
			return response;
		})
		.catch(function (error) {
			console.warn('[ServiceWorker|Post] Error from fetch: ', error);
			const body = {
				code: -2,
			};
			return new Response(JSON.stringify(body), {});
		});
};


/*** Register Routes ***/
function registerPostRoutes() {
	workbox.routing.registerRoute(
		pathToRegex(apiMethods["qdacity.project.insertProject"]),
		insertProjectHandler,
		'POST'
	);
	workbox.routing.registerRoute(
		pathToRegex(apiMethods["qdacity.course.insertCourse"]),
		defaultRejectPostHandler,
		'POST'
	);
}
