import { notification } from "../../firmware/util.js"

export default class GlobalSettingsEditor extends HTMLElement {
	setupComponents() {
		this.appendChild(document.querySelector('template#globalSettingsEditor').content.cloneNode(true))

		this.btnSetupNotifications = this.querySelector("#setupNotifications");
		this.btnSetupNotifications.onclick = () => { 
			this.setupNotifications();
		};

		if (Notification.permission == "granted") {
			this.btnSetupNotifications.disabled = true;
		}

		this.btnTestNotifications = this.querySelector("#testNotifications")
		this.btnTestNotifications.onclick = () => { 
			this.testNotifications();
		};

		this.txtInstallDetails = this.querySelector("#installDetails");
		this.setupInstallDetails();

		window.globalSettings = this;
	}

	setupInstallDetails() {
		if (window.installPrompt == null) {
			this.txtInstallDetails.innerText = "Your browser won't allow installation at the moment."
		} else {
			var button = document.createElement("button");
			button.innerText = "install";
			button.onclick = () => { window.installPrompt.prompt(); }

			this.txtInstallDetails.innerText = "Installation is available! Click install below to install this as a native app. "
			this.txtInstallDetails.appendChild(button);
		}
	}

	setupNotifications() {
		Notification.requestPermission();
	}

	testNotifications() {
		notification("Test notification");
	}
}

window.customElements.define("global-settings-editor", GlobalSettingsEditor)
