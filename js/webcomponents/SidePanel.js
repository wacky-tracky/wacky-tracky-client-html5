import SidePanelListButton from './SidePanelListButton.js';

export default class SidePanel extends HTMLDivElement {
	setupElements() {
		this.dom = document.createElement('aside');
		this.appendChild(this.dom);
		//this.dom.resizable({ minWidth: 200, handles: 'e', resize: sidepanelResized});
		
		this.domTitle = document.createElement("h2");
		this.domTitle.innerText = "wacky-tracky"
		this.dom.appendChild(this.domTitle);


		this.dom.appendChild(document.querySelector('template#sidePanel').content.cloneNode(true))

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
	}

	toggle() {
		isVisible = $('div#sidepanel').css('display') == 'block';

		if (isVisible) {
			$('div#sidepanel').css('display', 'none');
			sidepanelResized();
		} else {
			$('div#sidepanel').css('display', 'inline-block');
			sidepanelResized();
		}

		window.sidepanelIcon.setVisible(isVisible)
	};

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
		this.domLists.append(menuItem);

		if (this.selectedItem == null) {
			this.selectedItem = menuItem;

			menuItem.select();
		}
	};

	deselectAll() {
		for (let menuItem of this.domLists.children) {
			menuItem.deselect();	
		}
	}

	addTag(tag) {
		this.domTags.append(tag);
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
		sidepanelResized();
	};

	addListMenuItem(list) {
		let item = document.createElement("side-panel-list-button");
		item.setFields(list);
		item.setupComponents();
		item.setListCallback(list);

		this.addMenuItem(item);

		sidepanelResized();

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

document.registerElement("side-panel", SidePanel);
