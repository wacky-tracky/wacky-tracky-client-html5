import './webcomponents/LoginForm.js';
import './webcomponents/Task.js';
import './webcomponents/SidePanel.js';
import './webcomponents/SidePanelTagButton.js';
import "./webcomponents/List.js";
import "./webcomponents/ContentPanel.js";

import { setBootMessage, setupDefaultContextMenuAction } from "../firmware/util.js"
import { ajaxRequest } from "../firmware/middleware.js"

export default class UiManager {
	constructor() {
		this.init();

		window.lists = {}
	}

	/**
	At this stage, the critical "boot" path is complete. 
	We have the minimum browser features, core javascript, etc.
	*/
	initSuccess(res) {
		document.querySelector("#bootMessage").remove();

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

		if (a != null && a.toString().includes("Failed to fetch")) {
			setBootMessage("Failed to fetch during init, are you offline?");
		} else {
			setBootMessage("Unknown init failure.");
		}

	}

	init() {
		setBootMessage("UiManager init");
		window.selectedItem = null;

		setupDefaultContextMenuAction();

		ajaxRequest.bind(this, {
			url: "init",
			success: this.initSuccess.bind(this),
			error: this.initFailure.bind(this)
		}).call()
	}

	loginSuccess() {
		window.loginForm.hide();
		
		window.sidepanel = document.createElement('side-panel')
		window.sidepanel.setupElements();
		document.body.appendChild(window.sidepanel);

		window.content = document.createElement("content-panel")
		window.content.setupComponents()
		document.body.appendChild(window.content);

		// Fetch tags, then lists, because List->Tasks need Tags to be available.
		this.fetchTags();
		this.fetchLists();
	}

	loadListFromHash() {
		if (window.location.hash.length > 0) {
			for (let list of window.lists) {
				let hashListTitle = window.location.hash.replace("#", "")

				if (window.content.list.getTitle() == hashListTitle) {
					// Prevents re-loading the list if it's already selected.
					return
				}

				if (list.getTitle() == window.location.hash.replace("#", "")) {
					list.select();
				}
			}
		}
	}

	fetchLists() {
		window.sidepanel.clearLists();

		ajaxRequest({
			url: 'listLists',
			success: (lists) => {
				lists.forEach((jsonList) => {
					let list = document.createElement("list-stuff")
					list.setFields(jsonList)

					let menuItem = window.sidepanel.addListMenuItem(list);
					list.setupComponents(menuItem)

					window.lists[jsonList.id] = list;
				});

				window.uimanager.loadListFromHash() // FIXME using window instead of this
			}
		});
	}

	fetchTags() {
		window.sidepanel.clearTags();

		ajaxRequest({
			url: 'listTags',
			success: (tags) => {
				window.tags = tags;

				tags.forEach((jsonTag) => {
					let tag = document.createElement("side-panel-tag-button")
					tag.setFields(jsonTag)
					tag.setupComponents();

					window.sidepanel.addTag(tag);
				});
			}
		});
	}

	renderTaskCreated(json) {
		let task = document.createElement("task-item");
		task.setFields(json);
		task.setupComponents();

		if (window.selectedItem === null) {
			window.content.list.add(task);
		} else {
			window.selectedItem.addSubtask(task);

			if (!window.selectedItem.isSubtasksVisible()) {
				window.selectedItem.toggleSubtasks();
			}
		}
	}
}
