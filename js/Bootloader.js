import LoginForm from './webcomponents/LoginForm.js';
import SidePanel from './webcomponents/Sidepanel.js';
import ContentArea from "./webcomponents/ContentArea.js";

export default class Bootloader {
	constructor() {
		this.init();
	}

	initSuccess(res) {
		if (res.wallpaper !== null) {
			let img = "url(/wallpapers/" + res.wallpaper + ")";
			document.body.style.backgroundImage = img;
		}

		window.loginForm = document.createElement('login-form');
		window.loginForm.create();

		if (res.username !== null) {
			this.loginSuccess()
		} else {
			window.loginForm.show();
		}
	}

	initFailure(a, b, c) {
		console.log(a, b, c);
		generalError("Could not init. Is the server running?", a, b, c);
	}

	init() {
		window.selectedItem = null;

		ajaxRequest({
			url: "init",
			success: this.initSuccess,
			error: this.initFailure
		});
	}

	loginSuccess() {
		console.log("login suc");
		window.loginForm.hide();
		window.content = document.createElement("content-area")
		
		window.sidepanel = document.createElement('side-panel')
		window.sidepanel.refreshLists();
		window.sidepanel.refreshTags();

		window.sidepanelIcon = document.createElement("side-panel-icon")

		sidepanelResized();
	}

}
