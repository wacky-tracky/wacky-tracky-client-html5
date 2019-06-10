import Tag from "./model/Tag.js";

import { setupDefaultContextMenuAction } from "../firmware/util.js"
import { ajaxRequest } from "../firmware/middleware.js"

export default class UiManager {
	constructor() {
		window.selectedItem = null;

		setupDefaultContextMenuAction();
	}

	loadListFromHash() {
		return;

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
		this.fetchTags();
		this.fetchLists();
	}

	fetchLists() {
		window.sidepanel.clearLists();
		window.lists = {}

		ajaxRequest({
			url: 'listLists',
			success: (lists) => {
				lists.forEach((jsonList) => {
					window.dbal.addListFromServer(jsonList)
				});

				window.uimanager.loadListFromHash() // FIXME using window instead of this
			}
		});

		window.dbal.getLists(this.renderLists)
	}

	renderLists(lists) {
		lists.forEach((mdlList) => {
			let list = document.createElement("list-stuff")
			list.setList(mdlList)

			let menuItem = window.sidepanel.addListMenuItem(mdlList, list);
			list.setupComponents(menuItem)

			window.lists[mdlList.getId()] = list; // FIXME deprecated
		});	
	}

	fetchTags() {
		window.sidepanel.clearTags();
		window.tags = []

		ajaxRequest({
			url: 'listTags',
			success: (jsonTags) => {
				jsonTags.forEach(json => {
					let mdlTag = new Tag(json);
					window.tags.push(mdlTag)

					window.sidepanel.addTag(mdlTag);
				});
			}
		});
	}

}
