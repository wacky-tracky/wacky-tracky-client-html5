window.host = "http://" + window.location.hostname + ":8082/";

function ajaxRequest(params) {
	if ($.isEmptyObject(params.error)) {
		params.error = generalError
	}

	$.ajax({
		url: window.host + params.url,
		error: params.error,
		success: params.success,
		data: params.data,
		dataType: 'json',
		type: 'GET',
		xhrFields: {
			withCredentials: true,
		},
		crossDomain: true
	});
}

function Tag(tagObject) {
	this.obj = tagObject;

	var self = this;

	this.domSidePanel = $('<li class = "selected tag' + this.obj.id + '">').text(this.obj.title);

	this.domDialog = $('<p>dialog</p>');
	this.domInputTitle = this.domDialog.createAppend('<input />').text(this.obj.title);

	Tag.prototype.toDomSidePanel = function() {
		return this.domSidePanel;
	};

	Tag.prototype.showDialog = function() {
		$(self.domDialog).dialog({
			title: 'Tag Options',
			close: self.requestUpdate
		});	
	};

	Tag.prototype.requestUpdate = function() {
		console.log(this.domInputTitle.val());
	}

	this.domSidePanel.rightClick(self.showDialog);
}

function Task(taskObject) {
	var self = this;
	this.parent = null;
	this.fields = taskObject;

	this.dom = $('<div class = "taskWrapper" />');
	this.domTask = this.dom.createAppend('<div class = "task" />').text(this.fields.content);
	this.domTask.click(function() { self.select(); });
	this.domTask.dblclick(function() { self.openEditDialog(); });
	this.domButtonExpand = this.domTask.createAppend('<button class = "expand" disabled = "disabled">+</button>').click(function() { self.refreshSubtasks(); });
	this.domTaskButtons = this.domTask.createAppend('<div class = "taskButtons" />');
	this.domButtonDelete = this.domTaskButtons.createAppend('<button>delete</button>');
	this.domButtonDelete.click(function() { self.del(); });
	this.domButtonDelete.css('display', 'none');
	this.domEditDialog = null;

	if (this.fields.hasChildren) {
		this.domButtonExpand.removeAttr('disabled');
	}

	this.domSubtasks = this.dom.createAppend('<div class = "subTasks" />');

	this.subtasks = [];

	Task.prototype.refreshSubtasks = function() {
		this.domSubtasks.children().remove();
		ajaxRequest({
			url: '/listTasks',
			data: { 
				task: this.fields.id 
			},
			success: this.renderSubtasks
		});
	};

	Task.prototype.renderSubtasks = function(subtasks) {
		$(subtasks).each(function(i, t) {
			t = new Task(t);

			// TODO Change this to "this" or "self"
			window.selectedItem.addSubtask(t);
		});
	};

	Task.prototype.openEditDialog = function() {
		this.closeEditDialog();

		this.domEditDialog = $('<div class = "editDialog" />');
		this.domEditId = this.domEditDialog.createAppend('<span />').text('ID:' + this.fields.id);

		this.dom.append(this.domEditDialog).fadeIn();
		this.domEditDialog.slideDown();
	};

	Task.prototype.addTagButtons = function() {
		var self = this;

		$(window.sidepanel.tags).each(function(i, tag) {
			button = self.domTask.createAppend('<button class = "tag" />').addClass('tag' + tag.obj.id).text(tag.obj.title);
			button.click(function() {
				self.tagItem(tag);
			});
		});
	};

	Task.prototype.tagItem = function(tag) {
		ajaxRequest({
			url: '/tag',
			data: {
				item: this.fields.id,
				tag: tag.obj.id
			}
		});

		this.toggleTag(tag.obj.id);
	};

	Task.prototype.toggleTag = function(id) {
		tag = this.domTask.children('.tag' + id);
		
		if (tag.hasClass('selected')) {
			tag.removeClass('selected');
		} else {
			tag.addClass('selected');
		}
	};

	Task.prototype.closeEditDialog = function() {
		this.dom.children('.editDialog').remove();
		this.domEditDialog = null;
	};

	Task.prototype.addSubtask = function(t) {
		t.parent = this;
		this.domSubtasks.append(t.toDom());
		this.subtasks.push(t);
	};

	Task.prototype.toDom = function() {
		return this.dom;
	};

	Task.prototype.select = function() {
		if (window.selectedItem == this || window.toDelete == this) {
			return;
		}

		if (window.selectedItem !== null) {
			window.selectedItem.deselect();
		}

		this.domButtonDelete.css('display', 'block');
		window.content.taskInput.setLabel(this.fields.content);

		window.selectedItem = this;
		this.dom.addClass('selected');
	};

	Task.prototype.deselect = function() {
		this.closeEditDialog();

		window.selectedItem = null;
		this.dom.removeClass('selected');

		this.domButtonDelete.css('display', 'none');
		window.content.taskInput.setLabel('');
	};

	Task.prototype.del = function(i) {
		window.selectedItem.deselect();

		window.toDelete = this;

		ajaxRequest({
			url: window.host + '//deleteTask',
			data: { id: this.fields.id },
			success: this.renderDelete
		});
	};

	Task.prototype.renderDelete = function() {
		window.toDelete.dom.remove();
		window.content.list.tasks.pop(window.toDelete);
		window.content.list.updateTaskCount();
		window.toDelete = null;
	};

	this.addTagButtons();
	$(this.fields.tags).each(function(i, tag) {
		self.toggleTag(tag.id);
	});


	return this;
}

function LoginForm() {
	var self = this;

	this.loginForm = $('<div id = "loginForm" />');
	$('body').append(this.loginForm);

	this.loginForm.createAppend('<h2 />').text('wacky-tracky');

	usernameRow = this.loginForm.createAppend('<p />');
	usernameRow.createAppend('<label for = "username">Username</label>');
	usernameInput = usernameRow.createAppend('<input id = "username" />');

	passwordRow = this.loginForm.createAppend('<p />');
	passwordRow.createAppend('<label for = "password">Password</label>');
	passwordInput = passwordRow.createAppend('<input id = "password" type = "password" />');
	passwordInput.onEnter(function() {
		tryLogin(usernameInput.val(), passwordInput.val());	
	});

	emailRow = this.loginForm.createAppend('<p id = "emailRow" />');
	emailRow.createAppend('<label for = "email">Email</label>');
	emailInput = emailRow.createAppend('<input type = "email" />');
	emailInput.onEnter(function() {
		tryRegister(usernameInput.val(), passwordInput.val(), emailInput.val());
	});
	emailRow.css('display', 'none');

	actionsRow = this.loginForm.createAppend('<p id = "loginButtons" />');
	actionRegister = actionsRow.createAppend('<button id = "register">Register</button>');
	actionRegister.click(function() { self.toggleRegistration(); });
	actionForgotPassword = actionsRow.createAppend('<button id = "forgotPassword">Forgot password</button>');
	actionForgotPassword.click(function() { window.alert("Aww. Not much I can do about that."); });
	actionsRow.createAppend('<button id = "login">Login</button>').click(function() { 
		if (emailRow.css('display') !== 'block') {
			tryLogin(usernameInput.val(), passwordInput.val(), emailInput.val()); 
		} else {
			tryRegister(usernameInput.val(), passwordInput.val(), emailInput.val());
		}
	});

	LoginForm.prototype.isShown = function() {
		return $('body').children('#loginForm').length > 0;
	};

	LoginForm.prototype.toggleRegistration = function() {
		if (!this.isShown()) {
			return;
		}

		if (this.isRegistrationShown()) {
			$('#emailRow').css('display', 'none');
			$('button#register').text('Register');
			$('button#forgotPassword').removeAttr('disabled');
			$('button#login').text('Login');
		} else {
			$('#emailRow').fadeIn();
			$('button#register').text('Cancel');
			$('button#forgotPassword').attr('disabled', 'disabled');
			$('button#login').text('Register');
		}
	};

	LoginForm.prototype.isRegistrationShown = function() {
		return $('#emailRow').css('display') == 'block';
	}

	LoginForm.prototype.hideRegistration = function() {
		if (this.isRegistrationShown()) {
			this.toggleRegistration();
		}

		$('input#password').focus();
		$('button#login').effect('highlight');
	};

	LoginForm.prototype.show = function() {
		$('body').css('display', 'block');

		if (typeof(window.sidepanel) != "undefined") {
			window.sidepanel.remove();
		}

		if (!this.isShown()) {
			this.loginForm.css('display', 'block');
		}
	};

	LoginForm.prototype.hide = function() {
		this.loginForm.css('display', 'none');
		$('body').css('display', 'table');
	};

	return this;
}

function registerSuccess() {
	window.loginForm.hideRegistration();
}

function tryRegister(username, password, email) {
	hashedPassword = CryptoJS.SHA3(password).toString();

	ajaxRequest({
		url: window.host + 'register',
		error: registerFail,
		success: registerSuccess,
		data: {
			username: username,
			password: hashedPassword,
			email: email,
		}
	});
}

function registerFail(req, dat) {
	generalErrorJson("Register fail. ", req)
}

function tryLogin(username, password) {
	hashedPassword = CryptoJS.SHA3(password).toString();
	console.log(password);

	ajaxRequest({
		url: window.host + 'authenticate',
		error: loginFail,
		success: loginSuccess,
		data: {
			username: username,
			password: hashedPassword,
		}
	});
}

function generalErrorJson(msg, res) {
	msg = "General JSON Error.";

	console.log(res);

	if (typeof(res.responseJSON) !== "undefined") {
		msg += ": " + res.responseJSON.message;
	}

	generalError(msg);
}

function loginFail(res, dat) {
	generalErrorJson("Login Failure. ", res);

}

function loginSuccess() {
	hideAllErrors();

	window.loginForm.hide();
	
	window.sidepanel = new SidePanel();
	$('body').append(window.sidepanel.toDom());

	window.sidepanel.refreshLists();
	window.sidepanel.refreshTags();

	window.content = new Content();
	$('body').append(window.content.toDom());

	sidepanelResized();
}

function initSuccess(res) {
	if (res.wallpaper !== null) {
		img = "url(wallpapers/" + res.wallpaper + ")";
		$('body').css('background-image', img);
	}

	window.loginForm = new LoginForm();

	if (res.username !== null) {
		loginSuccess();
	} else {
		window.loginForm.show();
	}
}

function initFailure(a, b, c) {
	generalError("Could not init. Is the server running?");
}

function init() {
	window.selectedItem = null;

	ajaxRequest({
		url: window.host + 'init',
		error: initFailure,
		success: initSuccess,
		dataType: 'json',
		type: 'GET',
		xhrFields: {
			withCredentials: true,
		},
		crossDomain: true
	});
}

function Content() {
	this.dom = $('<div id = "content" />');
	this.taskInput = new TaskInputBox();
	this.dom.append(this.taskInput.toDom());
	this.domListContainer = this.dom.createAppend('<div>');

	this.list = null;

	Content.prototype.toDom = function() {
		return this.dom;
	};

	Content.prototype.setList = function(list) {
		window.selectedItem = null;

		this.list = list;
		this.domListContainer.children().remove();
		this.domListContainer.append(list.toDomContent());
		this.domListContainer.append(new ListControls(list).toDom());

		this.taskInput.enable();
	};

	return this;
}

function newTask(text) {
	if ($.isEmptyObject(text)) {
		return;
	}

	$('input#task').val('');

	data = { content: text };

	if (window.selectedItem === null) {
		data.parentId = window.content.list.fields.id;
		data.parentType = 'list';
	} else {
		data.parentId = window.selectedItem.fields.id;
		data.parentType = 'task';
	}

	ajaxRequest({
		url: window.host + 'createTask',
		success: renderTaskCreated,
		data: data
	});
}

function renderTaskCreated(task) {
	if (window.selectedItem === null) {
		window.content.list.add(new Task(task));
	} else {
		window.selectedItem.addSubtask(new Task(task));
	}
}

function TaskInputBox(label) {
	this.label = null;

	this.dom = $('<div class = "itemInput" />');
	this.domLabel = this.dom.createAppend('<span />');
	this.domInput = this.dom.createAppend('<input id = "task" value = "" />');
	this.domInput.attr('disabled', 'disabled');
	this.domInput.model(this);
	this.domInput.keypress(function(e) {
		var key = e.keyCode ? e.keyCode : e.which;

		if (key == 13) {
			newTask($(this).val(), window.content.list.fields.id);
		}
	});

	TaskInputBox.prototype.toDom = function() {
		return this.dom;
	};

	TaskInputBox.prototype.enable = function() {
		this.domInput.removeAttr('disabled');
		this.domInput.focus();
	};
	
	TaskInputBox.prototype.setLabel = function(label) {
		if (!$.isEmptyObject(label)) {
			label += ': ';
		}

		this.domLabel.text(label);
		this.domInput.width(this.dom.width() - this.domLabel.width() - 20);
	};

	return this;
}

$.fn.rightClick = function(callback) {
	$(this).on("contextmenu", function(e) {
		if (e.which == 3) {
			callback();
			e.preventDefault();
		}
	});
};

$.fn.onEnter = function(callback) {
	this.keyup(function(e) {
		if (e.keyCode == 13) {
			callback();
		}
	});
};

$.fn.createAppend = function(constructor) {
	var childElement = $(constructor);

	$(this).append(childElement);

	return $(childElement);
};

$.fn.model = function() {
	if (typeof(this.data('model')) == "undefined") {
		this.data('model', {});
	}

	return this.data('model');
};

function renderTasks(list) {
	window.content.list.addAll(list);
}

function generalError(errorText) {
	console.log("error", errorText);
	console.log(new Error().stack);
	$('body').createAppend($('<div class = "notification">').text('Error: ' + errorText)).click(function() {
		this.remove();	
	});
}

function hideAllErrors() {
	$('body').children('.notification').remove();
}

function requestTasks(list) {
	window.content.setList(list);

	ajaxRequest({
		url: window.host + '/listTasks',
		data: { list: list.fields.id },
		success: renderTasks,
		error: generalError
	});
}

function ListControls(list) {
	this.list = list;

	var self = this;

	this.dom = $('<div class = "buttonToolbar listControls" />');
	this.dom.model(this);
	this.domLabel = this.dom.createAppend('<span />').text(this.list.fields.title);
	this.domButtonDelete = this.dom.createAppend('<button />').text("Delete");
	this.domButtonDelete.click(function (e) { self.del(); });

	ListControls.prototype.del = function() {
		this.list.del();
	};

	ListControls.prototype.toDom = function() {
		return this.dom;
	};

	return this;
}

function List(jsonList) {
	this.fields = jsonList;

	this.domSidePanel = $('<li class = "list" />');
	this.domSidePanel.model(this);
	this.domSidePanelTitle = this.domSidePanel.createAppend('<a href = "#" class = "listTitle" />').text(this.fields.title);
	this.domSidePanelTitleSuffix = this.domSidePanelTitle.createAppend('<span class = "subtle" />');

	this.domList = $('<ul id = "taskList" />');

	this.tasks = [];

	var self = this;

	this.updateTaskCount = function(newCount) {
		if (newCount === null) {
			newCount = this.tasks.length;
		}

		this.domSidePanelTitleSuffix.text(newCount);
	};

	this.domSidePanelTitle.click(function(e) {
		self.select();
	});

	List.prototype.select = function() {
		requestTasks(this);

		window.sidepanel.deselectAll();
		this.domSidePanel.addClass('selected');
	};

	List.prototype.toDomSidePanel = function () {
		return this.domSidePanel;
	}; 

	List.prototype.toDomContent = function() {
		return this.domList;
	};

	List.prototype.addAll = function(tasks) {
		var self = this;

		this.clear();

		$(tasks).each(function(index, item) {	
			self.add(new Task(item));
		});
		
		self.updateTaskCount();
	};

	List.prototype.add = function(task) {
		this.tasks.push(task);
		this.domList.append(task.toDom());

		this.updateTaskCount();
	};

	List.prototype.deselect = function() {
		this.domSidePanel.removeClass('selected');
	};

	List.prototype.clear = function() {
		this.domList.children().remove();
		this.tasks.length = 0;
	};

	List.prototype.del = function() {	
		ajaxRequest({
			url: window.host + 'deleteList',
			data: { id: this.fields.id },
			success: window.sidepanel.refreshLists
		});
	};

	this.updateTaskCount(this.fields.count);

	return this;
}

function sidepanelResized() {
	window.content.dom.css('left', window.sidepanel.dom.css('width'));
	window.content.dom.css('right', $('body').css('width'));
}

function SidePanel() {
	var self = this;

	this.dom = $('<div id = "sidepanel" />');
	this.dom.model(this);
	this.dom.resizable({ minWidth: 200, handles: 'e', resize: sidepanelResized});
	this.domTitle = this.dom.createAppend('<h2>wacky-tracky</h2>');
	this.domLists = this.dom.createAppend('<ul class = "lists" />');
	this.domTags = this.dom.createAppend('<ul class = "tags" />');
	this.domButtonNewList = this.dom.createAppend('<button>New List</button>').click(function() { self.createList(); });
	this.domButtonNewTag = this.dom.createAppend('<button>New Tag</button>').click(function() { self.createTag(); });
	this.domButtonRefresh = this.dom.createAppend('<button class = "refresh" />').html('&nbsp;').click(function() { self.refreshLists(); });

	this.lists = [];
	this.tags = [];

	SidePanel.prototype.createTag = function() {
		var title = window.prompt("Tag name?");

		if ($.isEmptyObject(title)) {
			return;
		}

		ajaxRequest({
			url: window.host + '/createTag',
			data: {
				title: title
			},
			success: this.refreshTags
		});
	};

	SidePanel.prototype.createList = function() {
		var title = window.prompt("List name?");

		if ($.isEmptyObject(title)) {
			return;
		}

		ajaxRequest({
			url: window.host + '/createList',
			data: {
				title: title
			},
			success: this.refreshLists
		});

	};

	SidePanel.prototype.addList = function(list) {
		this.domLists.append(list.toDomSidePanel());
		this.lists.push(list);
	};

	SidePanel.prototype.addTag = function(tag) {
		this.domTags.append(tag.toDomSidePanel());
		this.tags.push(tag);
	};

	SidePanel.prototype.toDom = function() {
		return this.dom;
	};

	SidePanel.prototype.clear = function() {
		this.domLists.children().remove();
		this.lists.length = 0;
	};

	SidePanel.prototype.deselectAll = function() {
		$(this.lists).each(function(index, list) {
			list.deselect();
		});
	};

	SidePanel.prototype.refreshLists = function() {
		ajaxRequest({
			url: window.host + '/listLists',
			success: self.renderLists,
			dataType: 'json',
			type: 'GET',
			xhrFields: {
				withCredentials: true,
			},
			crossDomain: true
		});
	};

	SidePanel.prototype.refreshTags = function() {
		ajaxRequest({
			url: window.host + 'listTags',
			success: this.renderTags
		});
	};

	SidePanel.prototype.renderTags = function(tags) {
		ret = "";

		$(tags).each(function(index, tag) {
			ret += '.tag' + tag.id + '.selected, .tag' + tag.id + ':hover { background-color: #' + getNextTagColor() + ' }' + "\n";
			self.addTag(new Tag(tag));
		});

		$('body').append($('<style type = "text/css">' + ret + '</style>'));
	};

	SidePanel.prototype.renderLists = function(lists) {
		self.clear();

		$(lists).each(function(index, list) {
			self.addList(new List(list));
		});

		if (self.lists.length > 0) {
			self.lists[0].select();
		}
	};

	return this;
}

window.tagCount = 0;

function getNextTagColor() {
	window.tagCount++;

	// http://www.tinygorilla.com/Easter_eggs/PallateHex.html

	switch (window.tagCount) {
		case 1: return "F7977A";
		case 2: return "C4DF9B";
		case 3: return "7EA7D8";
		case 4: return "F9AD81";
		case 5: return "8882BE";
		case 6: return "F49AC2";
		default: return "000000";
	}
}

$(document).keyup(function(e) {
	if (e.keyCode == 27) {
		if (window.selectedItem !== null) {
			window.selectedItem.deselect();
		}
	}

	if (e.keyCode == 46) {
		if (window.selectedItem !== null) {
			window.selectedItem.del();
		}
	}
});
