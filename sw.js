self.addEventListener("fetch", e => {
	console.log("SW Fetch: " + e.request.url);

	if (e.request.method != "GET") {
		console.log("SW ignoring !GET request");
	}

	e.respondWith(
		caches.match(e.request).then(cached => {
			if (cached) {
				console.log("Serving from cache: " + e.request.url);
				return cached;
			} else {
				return fetch (e.request);
			}
		})
	);
});

self.addEventListener("message", m => {
	console.log("message!" + m);
	notification("foo");
});

self.addEventListener("activate", e => {
	console.log("SW Activated");
});

self.addEventListener("install", e => {
	e.waitUntil(
		caches.open("wt-cache").then(cache => {
			return cache.addAll([
				'/',
				'/style.css',
				'/manifest.json',
				'/js/firmware/util.js',
				'/js/firmware/keyboardShortcuts.js',
				'/js/firmware/middleware.js',
				'/js/firmware/sw_loader.js',
				'/dist/index.js',
				'/resources/images/logos/wacky-tracky.png',
				'/resources/images/logos/wacky-tracky-192.png',
				'/resources/images/logos/wacky-tracky-512.png',
			])
		}
		).then(state => {
			console.log("Install completed");
		})
	);
});
