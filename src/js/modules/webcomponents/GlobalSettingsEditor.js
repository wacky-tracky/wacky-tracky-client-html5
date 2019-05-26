import { notification } from "../../firmware/util.js"

export default class GlobalSettingsEditor extends HTMLElement {
	setupComponents() {
		this.appendChild(document.querySelector('template#globalSettingsEditor').content.cloneNode(true))

		this.btnSetupNotifications = this.querySelector("#setupNotifications");
		this.btnSetupNotifications.onclick = () => { 
			this.setupNotifications();
		};

		this.btnTestNotifications = this.querySelector("#testNotifications")
		this.btnTestNotifications.onclick = () => { 
			this.testNotifications();
		};

		window.globalSettings = this;
	}

	setupNotifications() {
		Notification.requestPermission();
	}

	testNotifications() {
		notification("Test notification");
	}
}

window.customElements.define("global-settings-editor", GlobalSettingsEditor)
