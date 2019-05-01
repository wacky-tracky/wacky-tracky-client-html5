import "./js/firmware/middleware.js"
import "./js/firmware/keyboardShortcuts.js";
import "./js/firmware/sw_loader.js";

import UiManager from "./js/modules/UiManager.js";

export default function main() {
	window.uimanager = new UiManager();
}

main();
