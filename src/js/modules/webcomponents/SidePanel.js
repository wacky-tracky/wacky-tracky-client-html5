import './SidePanelToggleButton.js';
import './SidePanelListButton.js';
import './GlobalSettingsEditor.js';

import { ajaxRequest } from "../../firmware/middleware.js"
import { logoutRequest, promptChangePassword } from "../../firmware/util.js"

export default class SidePanel extends HTMLElement {
	setupElements() {
		this.dom = document.createElement('aside');
		this.appendChild(this.dom);

		this.currentSublistTitle = null;
		this.currentSublistDom = null;
			
		this.dom.appendChild(document.querySelector('template#sidePanel').content.cloneNode(true))

		this.domMenuButton = this.dom.querySelector("#sidepanelMenuButton")

		this.mnu = document.createElement("popup-menu")
		this.mnu.addTo(this.domMenuButton)
		this.mnu.addItem("Toggle sidebar", () => { this.toggle() }, "t");
		this.mnu.addItem("Settings", () => { 
			var settings = document.createElement("global-settings-editor");
			settings.setupComponents();

			window.content.setTab(settings);	
		});
		this.mnu.addItem("Logout", logoutRequest);

		this.domLists = this.querySelector("#listList")

		this.domTagContainer = this.querySelector("div#tagList")

		this.domButtonNewTag = this.querySelector("button#newTag")
		this.domButtonNewTag.onclick = () => { this.createTag() };

		this.domButtonNewList = this.querySelector("button#newList")
		this.domButtonNewList.onclick = () => { this.createList() };

		this.domButtonRefresh = this.querySelector("button#refresh");
		this.domButtonRefresh.onclick = () => { window.uimanager.fetchLists() }

		this.domButtonIssue = this.querySelector("button#raiseIssue");
		this.domButtonIssue.onclick = () => { window.open("http://github.com/wacky-tracky/wacky-tracky-client-html5/issues/new") }

		this.toggleIcon = document.createElement("side-panel-toggle-button")
		this.toggleIcon.setupComponents();
	}

	getToggleButton() {
		return this.toggleIcon;
	}

	toggle() {
		if (this.dom.hidden) {
			this.dom.hidden = false;
			this.toggleIcon.hidden = true;
		} else {
			this.dom.hidden = true;
			this.toggleIcon.hidden = false;
		}
	}

	createTag() {
		var title = window.prompt("Tag name?");

		if (title == "") {
			return;
		}

		ajaxRequest({
			url: 'createTag',
			data: {
				title: title
			},
			success: window.uimanager.fetchTags
		});
	}

	createList() {
		var title = window.prompt("List name?");

		if (title == "") {
			return;
		}

		ajaxRequest({
			url: 'createList',
			data: {
				title: title
			},
			success: window.uimanager.fetchLists
		});
	}

	addMenuItem(menuItem) {
		let li = document.createElement("li")
		li.appendChild(menuItem);

		var owner = this.domLists;

		if (menuItem.list.getTitle().includes(">")) {
			var titleComponents = menuItem.list.getTitle().split(">")
			titleComponents.length--;
			titleComponents = titleComponents.join(">")

			var menuListTitleEl = menuItem.querySelector(".listTitle")
			menuListTitleEl.innerText = menuListTitleEl.innerText.replace(titleComponents + ">", "");

			if (this.currentSublistTitle != titleComponents){
				this.currentSublistTitle = titleComponents;

				var sublist = document.createElement("div");
				sublist.classList.add("sublist")
				this.domLists.appendChild(sublist);
	
				var sublistItems = document.createElement("div");
				sublistItems.classList.add("subListItems");
				sublistItems.hidden = true;
				
				this.currentSublistDom = sublistItems;

				var title = document.createElement("p");
				var indicator = document.createElement("span");
				indicator.innerHTML = "&#128193;";
				title.classList.add("subListTitle");
				title.onclick = () => { 
					if (sublistItems.hidden) {
						sublistItems.hidden = false;
						indicator.innerHTML = "&#128194;"
					} else {
						sublistItems.hidden = !sublistItems.hidden; 
						indicator.innerHTML = "&#128193;"
					}
				}
				
				title.appendChild(indicator);
				var text = document.createElement("span");
				text.innerText = titleComponents;
				title.appendChild(text);

				sublist.appendChild(title);
				sublist.appendChild(sublistItems);

				owner = sublistItems;
			} else {
				owner = this.currentSublistDom;
			}
		} else {
			this.currentSublistTitle = null;
			this.currentSublistDom = null;
			
			owner = this.domLists;
		}

		owner.append(li);
	}

	deselectAll() {
		for (let menuItem of this.domLists.querySelectorAll("side-panel-list-button")) {
			menuItem.deselect();	
		}
	}

	addTag(mdlTag) {
		let elTag = document.createElement("side-panel-tag-button")
		elTag.setTag(mdlTag)
		elTag.setupComponents();

		if (window.lastTag != mdlTag.getTitle()) {
			window.lastTag = mdlTag.getTitle()
			let tagName = document.createElement("div")
			tagName.innerHTML = "&#128193" + mdlTag.getTitle();
			this.domTagContainer.append(tagName);

			this.lastDomTags = document.createElement("ul");
			this.lastDomTags.classList.add("tagList")
			this.domTagContainer.append(this.lastDomTags);
		}

		let li = document.createElement("li")
		li.append(elTag);
		this.lastDomTags.append(li);
	}

	toDom() {
		return this.dom;
	}

	clearLists() {
		while (this.domLists.hasChildNodes()) {
			this.domLists.firstChild.remove();
		}
	}

	clearTags() {
		let tags = this.querySelector("div#tagList")

		while (tags.hasChildNodes()) {
			tags.firstChild.remove();
		}
	}

		/**
	renderTags(tags) {
		let ret = "";

		tags.forEach(tag => {
			ret += '.tag' + tag.id + '.tagTitle { border-left: 4px solid ' + tag.backgroundColor + ' !important }' + "\n";
			ret += '.tag' + tag.id + '.indicator { background-color:' + tag.backgroundColor + ' !important }' + "\n";
			this.addTag(new Tag(tag));
		});

		//$('body').append($('<style type = "text/css">' + ret + '</style>'));
		
	}
	*/

	addListMenuItem(mdlList, list) {
		let item = document.createElement("side-panel-list-button");
		item.setFields(list);
		item.setupComponents();
		item.setListCallback(mdlList, list);

		this.addMenuItem(item);

		return item;
	}

	hide() {
		this.dom.hide();
	}

	setupMenu() {
		let menuUser = document.createElement("popup-menu");
		menuUser.addItem('Toggle', this.toggle);
		menuUser.addItem('Change password', promptChangePassword);
		menuUser.addItem('Logout', logoutRequest);
		menuUser.addTo(this.domTitle);
	}
}

window.customElements.define("side-panel", SidePanel)
