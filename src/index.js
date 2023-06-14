import "./buildid.js";

// "firmware" is essential non-modularized code.
import "./js/firmware/middleware.js"
import "./js/firmware/keyboardShortcuts.js";
import "./js/firmware/sw_loader.js";

// webcomponents are modularized UI elements, that are needed by createElement, 
// and cannot be imported as-needed so they are imported here. They all call
// defineElement in their source files.
import './js/modules/webcomponents/LoginForm.js';
import './js/modules/webcomponents/TaskContent.js';
import './js/modules/webcomponents/SidePanel.js';
import './js/modules/webcomponents/SidePanelTagButton.js';
import "./js/modules/webcomponents/ListContent.js";
import "./js/modules/webcomponents/ContentPanel.js";

function onMessage(evt) {
//	console.log("onMessage", evt);
}

window.addEventListener('message', event => {onMessage(event); }, false);

import UiManager from "./js/modules/UiManager.js";
window.uimanager = new UiManager();

import Bootloader from "./js/modules/Bootloader.js";
window.bootloader = new Bootloader();
window.bootloader.init();
