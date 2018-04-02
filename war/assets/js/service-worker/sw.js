self.addEventListener('install', function(event) {
    console.log('Service Worker installing.');
});
self.addEventListener('activate', function(event) {
    console.log('Service Worker activating.');
});
self.addEventListener( "fetch" , function (event) {
    //fetch request as specified by event object
    console.log(event.request); //Note that Request and Response are also objects
});
