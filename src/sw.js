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
});

self.addEventListener("activate", () => {
	console.log("SW Activated");
});

self.addEventListener("install", e => {
	e.waitUntil(
		caches.open("wt-cache").then(cache => {
			return cache.addAll([
				'/',
				'/src.js',
				'/style.css',
				'/sw.js',
				'/wacky-tracky-192.0a09cec1.png',
				'/wacky-tracky-512.36ca84c2.png',
				'/wacky-tracky.75aacf35.png',
				'/wt.webmanifest',
			])
		}
		).then(state => {
			console.log("Install completed", state);
		})
	);
});
