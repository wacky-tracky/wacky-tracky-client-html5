import { notification } from "./util.js"

if ("serviceWorker" in navigator) {

	navigator.serviceWorker.register(new URL('../../sw.js', import.meta.url)).then(
		reg => {
			reg.onupdatefound = () => {
				var installingWorker = reg.installing;

				installingWorker.onstatechange = () => {
					switch (installingWorker.state) {
						case 'installed':
							if (navigator.serviceWorker.controller) {
								console.log("App has been updated. Please refresh.");
							} else {
								console.log("App is now available offline!");
							}
							break;
						case 'redundant':
							console.log("The installing SW became redundant");
							break;
					}
				}
			}
		},
		function() {
			notification("Service Worker Registration failed");
		}
	);
}

window.installPrompt = null;

window.addEventListener("beforeinstallprompt", e => {
	e.preventDefault()
	window.installPrompt = e;
})

