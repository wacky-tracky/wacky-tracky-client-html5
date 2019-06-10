import DBAL from "./DBAL.js";

import { setBootMessage } from "../firmware/util.js"
import { ajaxRequest } from "../firmware/middleware.js"

/**
The bootloader sets up essential browser features, imports all the needed 
"core" functionality, and gets the app to a point where it should be able to
render either a working UI, or sensible error messages.

The bootloader hands off to the UiManager when complete.
*/
export default class Bootloader {
	init() {
		setBootMessage("Bootloader init");

		window.dbal = new DBAL();

		try {
		ajaxRequest.bind(this, {
			url: "init",
			success: this.initSuccess.bind(this),
			error: this.initFailure.bind(this)
		}).call()
		} catch (Exception) {
			console.log("ex");
		}
	}

	/**
	At this stage, the critical "boot" path is complete. 
	We have the minimum browser features, core javascript, etc.
	*/
	initSuccess(res) {
		window.uimanager.onBootloaderSuccess(res);
	}

	initFailure(a, b, c) {
		console.log("initFailure", a, b, c);

		if (a != null && a.toString().includes("Failed to fetch")) {
//`			setBootMessage("Failed to fetch during init, are you offline?");
			window.uimanager.onBootloaderOffline();
		} else {
			setBootMessage("Unknown init failure.");
		}

	}	
}
