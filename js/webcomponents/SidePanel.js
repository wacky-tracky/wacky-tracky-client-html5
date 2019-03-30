import SidePanelToggleIcon from './SidePanelToggleButton.js';
import SidePanelListButton from './SidePanelListButton.js';

export default class SidePanel extends HTMLElement {
	setupElements() {
		this.dom = document.createElement('aside');
		this.appendChild(this.dom);
			
		this.dom.appendChild(document.querySelector('template#sidePanel').content.cloneNode(true))

		this.domTitle = this.dom.querySelector("h2")

		this.mnu = document.createElement("popup-menu")
		this.mnu.addTo(this.domTitle)
		this.mnu.addItem("Toggle sidebar", () => { this.toggle() });
		this.mnu.addItem("Logout", logoutRequest);

		this.domLists = this.querySelector("#listList")

		this.domTags = this.querySelector("#tagList")

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

		this.appendChild(this.toggleIcon)
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
	};

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
	};

	addMenuItem(menuItem) {
		let li = document.createElement("li")
		li.appendChild(menuItem);

		this.domLists.append(li);
	}

	deselectAll() {
		for (let menuItem of this.domLists.children) {
			menuItem.firstElementChild.deselect();	
		}
	}

	addTag(tag) {
		let li = document.createElement("li")
		li.append(tag);
		this.domTags.append(li);
	};

	toDom() {
		return this.dom;
	};

	clearLists() {
		while (this.domLists.hasChildNodes()) {
			this.domLists.firstChild.remove();
		}
	}

	clearTags() {
		while (this.domTags.hasChildNodes()) {
			this.domTags.firstChild.remove();
		}
	};

	renderTags(tags) {
		var ret = "";

		tags.forEach(tag => {
			ret += '.tag' + tag.id + '.tagTitle { border-left: 4px solid ' + tag.backgroundColor + ' !important }' + "\n";
			ret += '.tag' + tag.id + '.indicator { background-color:' + tag.backgroundColor + ' !important }' + "\n";
			this.addTag(new Tag(tag));
		});

		//$('body').append($('<style type = "text/css">' + ret + '</style>'));
	};

	addListMenuItem(list) {
		let item = document.createElement("side-panel-list-button");
		item.setFields(list);
		item.setupComponents();
		item.setListCallback(list);

		this.addMenuItem(item);

		return item;
	};

	hide() {
		this.dom.hide();
	};

	setupMenu() {
		menuUser = new Menu('User Menu');
		menuUser.addItem('Toggle', this.toggle);
		menuUser.addItem('Change password', promptChangePassword);
		menuUser.addItem('Logout', logoutRequest);
		menuUser.addTo(this.domTitle);
	}
}

window.customElements.define("side-panel", SidePanel)
