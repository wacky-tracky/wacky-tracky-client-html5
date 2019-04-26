import notification from "./util.js"

if ("serviceWorker" in navigator) {

	navigator.serviceWorker.register("/sw.js").then(
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
							console.error("The installing SW became redundant");
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

window.addEventListener("beforeinstallprompt", e => {
	e.preventDefault()
	window.deferredPrompt = e;

	notification("good", "Would you like to install the app?", (html) => {
		console.log("OK! Prompting!")
		html.remove();
		window.deferredPrompt.prompt();
	})
})

