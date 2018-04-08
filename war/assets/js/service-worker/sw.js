importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');


workbox.routing.registerRoute(
    /.*/,
    workbox.strategies.networkFirst()
);

/*
workbox.routing.registerRoute(
   /.*\.js/,
    workbox.strategies.networkFirst()
);
// workbox.routing.registerRoute(
//     /(?!sw\.js).*\.js/,
//     workbox.strategies.networkFirst()
// );

workbox.routing.registerRoute(
    // Cache CSS files
    /.*\.css/,
    // Use cache but update in the background ASAP
    workbox.strategies.staleWhileRevalidate({
        // Use a custom cache name
        cacheName: 'css-cache',
    })
);


workbox.routing.registerRoute(
    '/PersonalDashboard',
    workbox.strategies.networkFirst(),
);

workbox.routing.registerRoute(
    '/',
    workbox.strategies.networkFirst(),
);


workbox.routing.registerRoute(
    // Cache image files
    /.*\.(?:png|jpg|jpeg|svg|gif)/,
    // Use the cache if it's available
    workbox.strategies.cacheFirst({
        // Use a custom cache name
        cacheName: 'image-cache',
        plugins: [
            new workbox.expiration.Plugin({
                // Cache only 20 images
                maxEntries: 20,
                // Cache for a maximum of a week
                maxAgeSeconds: 7 * 24 * 60 * 60,
            })
        ],
    })
);
*/

// TODO background sync
const postHandler = ({url, event}) => {
    console.log("[Workbox] POST handler called");
    return fetch(event.request)
        .then(function (response) {
            if (!response) {
                console.log("[ServiceWorker|POST] No response from fetch ", event.request.url);
                return response;
            }
            console.log("[ServiceWorker|POST] Good Response from fetch ", event.request.url);
            console.log(response);

            return response;
            })
        .catch(function (error) {
            console.warn('[ServiceWorker|Post] Error from fetch: ', error);
        });
    //return new Response(`Custom handler response.`);
};

workbox.routing.registerRoute(
    //"_ah/api/qdacity/v14/project?alt=json",
    /\/_ah\/api\/*/,
    postHandler,
    'POST'
);


/**
const cacheName = 'v5';


const cacheFiles = [
    '/',
    'dist/js/styles.css',
    'components/font-awesome/css/font-awesome.min.css',
    'Settings',
    'PersonalDashboard',
    'dist/js/index.dist.js',
    new Request('https://apis.google.com/js/client.js?onload=resolveClient', {mode: 'no-cors'}),
    new Request('https://apis.google.com/js/client.js?onload=resolvePlatform', {mode: 'no-cors'}),

];


self.addEventListener('install', function (event) {
    console.log('[ServiceWorker] installing.');
    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(cacheFiles)

        })
    )
});
self.addEventListener('activate', function (event) {
    console.log('Service Worker activating.');

});
self.addEventListener("fetch", function (event) {
    //fetch request as specified by event object
    if (true || event.request.url === "http://localhost:8888/Settings") {
        event.respondWith(
            caches.match(event.request).then(function (response) {

                if (response) {
                    console.log("[ServiceWorker] Found in cache ", event.request.url);

                    return response;
                }

                var requestClone = event.request.clone();

                return fetch(requestClone)
                    .then(function (response) {

                        if (!response) {
                            console.log("[ServiceWorker] No response from fetch ", event.request.url);
                            return response;
                        }
                        console.log("[ServiceWorker] Good Response from fetch ", event.request.url);

                        return response;

                    })
                    .catch(function (error) {
                        console.warn('Constructing a fallback response, ' +
                            'due to an error while fetching the real response:', error);

                        // For demo purposes, use a pared-down, static YouTube API response as fallback.
                        // var fallbackResponse = {
                        //     items: [{
                        //         snippet: {title: 'Fallback Title 1'}
                        //     }, {
                        //         snippet: {title: 'Fallback Title 2'}
                        //     }, {
                        //         snippet: {title: 'Fallback Title 3'}
                        //     }]
                        // };
                        // html_reponse = "offline";
                        //
                        // // Construct the fallback response via an in-memory variable. In a real application,
                        // // you might use something like `return fetch(FALLBACK_URL)` instead,
                        // // to retrieve the fallback response via the network.
                        // return new Response(html_reponse, {
                        //     headers: {'Content-Type': 'text/html'}
                        // });
                    })

                //return fetch(event.request);

            })
        )
    }
});

 **/
