export default class SidePanel extends HTMLDivElement {
	setupElements() {
		this.dom = $('<aside />');
		this.dom.model(this);
		this.dom.resizable({ minWidth: 200, handles: 'e', resize: sidepanelResized});
		this.domTitle = this.dom.createAppend('<h2>wacky-tracky</h2>');
		this.domLists = this.dom.createAppend('<ul class = "lists" />');
		this.domTags = this.dom.createAppend('<ul class = "tags" />');
		this.domButtonNewList = this.dom.createAppend('<button>New List</button>').click(function() { self.createList(); });
		this.domButtonNewTag = this.dom.createAppend('<button>New Tag</button>').click(function() { self.createTag(); });
		this.domButtonRefresh = this.dom.createAppend('<button class = "refresh" />').html('&nbsp;').click(function() { self.refreshLists(); })
		this.domButtonRaiseIssue = this.dom.createAppend('<button id = "raiseIssue">Issue!</button>').click(function() { window.open("http://github.com/wacky-tracky/wacky-tracky-client-html5/issues/new") });
		this.domButtonRaiseIssue.css('color', 'darkred').css('font-weight', 'bold');

		this.lists = [];
		this.tags = [];
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

		if ($.isEmptyObject(title)) {
			return;
		}

		ajaxRequest({
			url: 'createTag',
			data: {
				title: title
			},
			success: this.refreshTags
		});
	};

	createList() {
		var title = window.prompt("List name?");

		if ($.isEmptyObject(title)) {
			return;
		}

		ajaxRequest({
			url: 'createList',
			data: {
				title: title
			},
			success: this.refreshLists
		});

	};

	addList(list) {
		this.domLists.append(list.toDomSidePanel());
		this.lists.push(list);
	};

	addTag(tag) {
		this.domTags.append(tag.toDomSidePanel());
		this.tags.push(tag);
	};

	toDom() {
		return this.dom;
	};

	clear() {
		this.domLists.children().remove();
		this.lists.length = 0;
	};

	deselectAll() {
		$(this.lists).each(function(index, list) {
			list.deselect();
		});
	};

	refreshLists() {
		ajaxRequest({
			url: 'listLists',
			success: self.renderLists,
			dataType: 'json',
			type: 'GET',
			xhrFields: {
				withCredentials: true,
			},
			crossDomain: true
		});
	};

	refreshTags() {
		ajaxRequest({
			url: 'listTags',
			success: this.renderTags
		});
	};

	renderTags(tags) {
		var ret = "";

		$(tags).each(function(index, tag) {
			ret += '.tag' + tag.id + '.tagTitle { border-left: 4px solid ' + tag.backgroundColor + ' !important }' + "\n";
			ret += '.tag' + tag.id + '.indicator { background-color:' + tag.backgroundColor + ' !important }' + "\n";
			self.addTag(new Tag(tag));
		});

		$('body').append($('<style type = "text/css">' + ret + '</style>'));
		sidepanelResized();
	};

	renderLists(lists) {
		self.clear();

		$(lists).each(function(index, list) {
			self.addList(new List(list));
		});

		sidepanelResized();

		if (self.lists.length > 0) {
			self.lists[0].select();
		}
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
