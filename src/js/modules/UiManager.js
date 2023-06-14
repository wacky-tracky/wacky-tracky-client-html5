import { Tag } from "./model/Tag.js";

import { setupDefaultContextMenuAction } from "../firmware/util.js"
import { ajaxRequest } from "../firmware/middleware.js"

export class UiManager {
	constructor() {
		window.selectedItem = null;

		setupDefaultContextMenuAction();
	}

	loadListFromHash() {
		return;

		if (window.location.hash.length > 0) {
			for (let list of window.listElements) {
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

	onBootloaderSuccess(res) {
		document.querySelector("#initMessages").remove();

		if (res.wallpaper !== null) {
			let img = "url(/wallpapers/" + res.Wallpaper + ")";
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
	
	onBootloaderOffline() {
		document.querySelector("#initMessages").remove();

		this.setupMainView();
	}

	loginSuccess() {
		if (window.loginForm != null) {
			window.loginForm.hide();
		}

		this.setupMainView();
	}

	setupMainView() {	
		window.sidepanel = document.createElement('side-panel')
		window.sidepanel.setupElements();
		document.body.appendChild(window.sidepanel);

		window.content = document.createElement("content-panel")
		window.content.setupComponents()
		document.body.appendChild(window.content);

		// Fetch tags, then lists, because List->Tasks need Tags to be available.
		this.refreshTags();
		this.refreshLists();
	}

	refreshLists() {
		ajaxRequest({
			url: 'ListLists',
			success: (lists) => {
				lists.Lists.forEach((jsonList) => {
					window.dbal.addListFromServer(jsonList)
				});
			}
		});

		window.dbal.getLists(this.renderLists)
	}

	renderLists(lists) {
		window.sidepanel.clearLists();
		window.listElements = {}

		lists.forEach((mdlList) => {
			let list = document.createElement("list-stuff")
			list.setList(mdlList)

			let menuItem = window.sidepanel.addListMenuItem(mdlList, list);
			list.setupComponents(menuItem)

			window.listElements[mdlList.getId()] = list; // FIXME deprecated
		});	
	}

	refreshTags() {
		window.sidepanel.clearTags();

		ajaxRequest({
			url: 'ListTags',
			success: (jsonTags) => {
				jsonTags.Tags.forEach(json => {
					window.dbal.addTagFromServer(json)
				});
			}
		});

		window.dbal.getTags(this.renderTags);
	}

	renderTags(tags) {
		window.tagElements = []

		console.log("rendering tags: ", tags);

		tags.forEach((mdlTag) => {
			window.sidepanel.addTag(mdlTag);
		});
	}
}
