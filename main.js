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
	var self = this;

	this.obj = tagObject;

	this.domSidePanel = $('<li class = "selected tag' + this.obj.id + '">').text(this.obj.title);

	this.domDialog = $('<p>dialog</p>');
	this.domInputTitle = this.domDialog.createAppend('<input />').text(this.obj.title);
	this.domInputShortTitle = this.domDialog.createAppend('<input />').text(this.obj.shortTitle);

	Tag.prototype.toDomSidePanel = function() {
		return this.domSidePanel;
	};

	Tag.prototype.requestUpdate = function() {
		ajaxRequest({
			url: "/updateTag",
			data: {
				id: window.tag.obj.id,
				newTitle: window.tag.domInputTitle.val(),
				shortTitle: window.tag.domInputShortTitle.val()
			}
		});
	};

	Tag.prototype.showDialog = function() {
		window.tag = self;

		self.domInputTitle.val(self.obj.title);
		self.domInputShortTitle.val(self.obj.shortTitle);

		$(self.domDialog).dialog({
			title: 'Tag Options for ' + self.obj.title,
			close: self.requestUpdate
		});	
	};

	this.domSidePanel.rightClick(self.showDialog);

	return this;
}

function Task(taskObject) {
	var self = this;
	this.parent = null;
	this.fields = taskObject;

	this.dom = $('<div class = "taskWrapper" />');
	this.domTask = this.dom.createAppend('<div class = "task" />');
	this.domTask.click(function() { self.select(); });
	this.domTask.dblclick(function() { self.openEditDialog(); });
	this.domTaskContent = this.domTask.createAppend('<span class = "content" />').text(this.fields.content);
	this.domButtonExpand = this.domTask.createAppend('<button class = "expand" disabled = "disabled">+</button>').click(function() { self.refreshSubtasks(); });
	this.domTaskControls = this.domTask.createAppend('<div class = "controls" />');
	this.domTaskButtons = this.domTaskControls.createAppend('<div class = "taskButtons" />');
	this.domButtonDueDate = this.domTaskButtons.createAppend('<input />').disable();
	this.domButtonDelete = this.domTaskButtons.createAppend('<button>delete</button>');
	this.domButtonDelete.click(function() { self.del(); });
	this.domButtonDelete.css('display', 'none');
	this.domButtonTags = this.domTaskButtons.createAppend('<button>Tag </button>');

	this.menuTags = new Menu();
	this.menuTags.dropDown = true;
	this.menuTags.addTo(this.domButtonTags);
	
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

	Task.prototype.setDueDate = function(newDate) {
		if (newDate == null) {
			newDate = self.fields.dueDate;
		}

		if (newDate == null) {
			newDate = "";
		}

		if (newDate != "") {
			newDate = "Due: " + newDate;
		} else {
			newDate = "no due date"
		}

		self.domButtonDueDate.val(newDate);
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
			self.menuTags.addItem(tag.obj.shortTitle, function() {
				self.tagItem(tag);
			}).addClass('tag' + tag.obj.id);
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

		this.toggleTag(tag.obj);
	};

	Task.prototype.toggleTag = function(tag) {
		tagEl = this.menuTags.domItems.children('.tag' + tag.id);
		
		console.log(tag);

		if (tagEl.hasClass('selected')) {
			tagEl.removeClass('selected');

			this.domButtonTags.children('.tag' + tag.id).remove();
		} else {
			tagEl.addClass('selected');

			this.domButtonTags.createAppend('<span class = "tag selected tag' + tag.id + '">&nbsp;&nbsp;&nbsp;&nbsp;</span> ');
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

	Task.prototype.rename = function() {
		if (this.domTask.children('.renamer').length > 0) {
			this.domTask.children('.renamer').focus();
		} else {
			var self = this;
			
			this.isBeingRenamed = true;
			this.domTaskContent.text('');

			renamer = $('<input class = "renamer" />');
			renamer.val(this.fields.content);
			renamer.onEnter(function(el) {
				self.renameTo(el.val());
				el.remove();
			});

			this.domTask.append(renamer)
			renamer.focus();
		}
	};

	Task.prototype.renameTo = function(newContent) {
		this.isBeingRenamed = false;
		this.fields.content = newContent;
		this.domTaskContent.text(newContent);
	};

	Task.prototype.select = function() {
		if (window.selectedItem == this || window.toDelete == this) {
			return;
		}

		if (window.selectedItem !== null) {
			if (!window.selectedItem.deselect()) {
			}
		}

		this.domButtonDelete.css('display', 'inline-block');
		this.domButtonTags.css('display', 'inline-block');
		this.domButtonDueDate.model(this);
		this.domButtonDueDate.datepicker({dateFormat: 'yy-mm-dd', onSelect: self.requestUpdateDueDate});
		this.domButtonDueDate.removeAttr('disabled');

		window.content.taskInput.setLabel(this.fields.content);

		window.selectedItem = this;
		this.dom.addClass('selected');
	};

	Task.prototype.requestUpdateDueDate = function(newDate) {
		ajaxRequest({
			url: 'setDueDate',
			data: {
				"item": window.selectedItem.fields.id,
				"dueDate": newDate
			}
		});
	};

	Task.prototype.deselect = function() {
		if (window.selectedItem.isBeingRenamed) {
			window.selectedItem.domTask.children('.renamer').focus().effect('highlight');
			return false;
		}

		this.closeEditDialog();

		window.selectedItem = null;
		this.dom.removeClass('selected');

		this.domButtonDueDate.attr('disabled', 'disabled');

		this.domButtonDelete.css('display', 'none');

		if (!this.hasTags()) {
			this.domButtonTags.css('display', 'none');
		}

		window.content.taskInput.setLabel('');

		this.domTask.children('.renamer').remove();
	};

	Task.prototype.del = function(i) {
		if (window.selectedItem.isBeingRenamed) {
			return;
		}

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

	Task.prototype.hasTags = function() {
		return this.fields.tags.length;
	};

	this.setDueDate();
	this.addTagButtons();
	$(this.fields.tags).each(function(i, tag) {
		self.toggleTag(tag);
	});

	if (!this.hasTags()) {
		this.domButtonTags.css('display', 'none');
	}

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

		this.loginForm.show();
	};

	LoginForm.prototype.hide = function() {
		this.loginForm.hide();
		$('body').css('display', 'table');
	};

	return this;
}

function registerSuccess() {
	notification('good', 'Thanks for registering, you can now login!');

	window.loginForm.hideRegistration();
	window.content.remove();
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
		img = "url(/wallpapers/" + res.wallpaper + ")";
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

	Content.prototype.hide = function() {
		this.dom.hide();
	};

	Content.prototype.show = function() {
		this.dom.show();
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

	this.domInput.focus(function() {
		$(this).val('');
	});

	this.domInput.blur(function() {
		$(this).val(self.label);
	});

	TaskInputBox.prototype.toDom = function() {
		return this.dom;
	};

	TaskInputBox.prototype.enable = function() {
		this.domInput.removeAttr('disabled');
		this.domInput.focus();
	};
	
	TaskInputBox.prototype.setLabel = function(label) {
		if ($.isEmptyObject(label)) {
			this.label = "";
		} else {
			this.label = "Click to add subtask of: " + label;
		}

		this.domInput.val(this.label);
	};

	return this;
}

function renderTasks(list) {
	window.content.list.addAll(list);
}

function generalError(error) {
	console.log("generalError() = ", error);
	console.log("generalError() stack: ", new Error().stack);

	if (error.status == 500) {
		error = "Internal Server Error.";
	} else if (error.statusText == "error") {
		error = "Critical, unspecified client side error."
	} else if (typeof(error.responseJSON) != "undefined" && typeof(error.responseJSON.message) != "undefined") {
		error = error.responseJSON.message
	} else if (typeof(error) == "object") {
		error = error.toString()
	}

	notification('error', 'Error: ' + error);
}

function notification(cls, text) {
	$('body').createAppend($('<div class = "notification ' + cls + '">').text(text)).click(function() {
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
		data: { 
			list: list.fields.id,
			sort: list.fields.sort,
		},
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

	this.domButtonSettings = this.dom.createAppend('<button />').text('Settings');
	this.domButtonSettings.click(function (e) { self.showSettings(); });

	this.domButtonMore = this.dom.createAppend('<button />').text('^');
	
	this.menuMore = new Menu();
	this.menuMore.dropDown = true;
	this.menuMore.addItem('Download', null);
	this.menuMore.addTo(this.domButtonMore);

	ListControls.prototype.del = function() {
		this.list.del();
	};

	ListControls.prototype.toDom = function() {
		return this.dom;
	};

	ListControls.prototype.showSettings = function() {
		this.list.openDialog();
	};

	return this;
}

function List(jsonList) {
	this.fields = jsonList;

	this.domSidePanel = $('<li class = "list" />');
	this.domSidePanel.model(this);
	this.domSidePanelTitle = this.domSidePanel.createAppend('<a href = "#" class = "listTitle" />').text(this.fields.title);
	this.domSidePanelTitleSuffix = this.domSidePanelTitle.createAppend('<span class = "subtle" />');

	this.domDialog = $('<p>dialog</p>');
	this.domInputTitle = this.domDialog.createAppend('<p>title</p>').createAppend('<input />').text(this.fields.title);
	this.domInputSort = this.domDialog.createAppend('<p>sort</p>').createAppend('<select />');
	this.domInputSort.createAppend('<option value = "title">Title</option>');
	this.domInputSort.createAppend('<option value = "dueDate">Due Date</option>');

	this.domList = $('<ul id = "taskList" />');

	this.tasks = [];

	var self = this;

	List.prototype.openDialog = function() {
		var self = this;

		this.domInputTitle.val(this.fields.title);
		this.domInputSort.val(this.fields.sort);

		this.domDialog.dialog({
			title: "List options",
			close: function() {
				ajaxRequest({
					url: 'listUpdate',
					data: {
						list: self.fields.id,
						title: self.domInputTitle.val(),
						sort: self.domInputSort.val()
					}
				});
			}
		});
	};

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

	List.prototype.itemOffset = function(offset) {
		selectedItemIndex = -1;

		$(this.tasks).each(function(index, item) {
			if (item == window.selectedItem) {
				selectedItemIndex = index;
				return;
			}
		});

		if (selectedItemIndex != -1) {
			return this.tasks[selectedItemIndex + offset]
		} else {
			return null;
		}
	};

	List.prototype.nextSelect = function() {
		i = this.itemOffset(+1);

		if (i != null) {
			i.select();
		}
	};

	List.prototype.prevSelect = function() {
		i = this.itemOffset(-1);

		if (i != null) {
			i.select();
		}
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
	window.content.dom.css('left', window.sidepanel.dom.width());
	window.content.dom.css('right', $('body').css('width'));
}

function logoutRequest() {
	ajaxRequest({
		url: "logout",
		success: logoutSuccess
	});
}

function logoutSuccess() {
	location.reload();
}

function changePassword() {
	window.alert("cant do that yet");
}

function SidePanel() {
	var self = this;

	this.dom = $('<div id = "sidepanel" />');
	this.dom.model(this);
	this.dom.resizable({ minWidth: 200, handles: 'e', resize: sidepanelResized});
	this.domTitle = this.dom.createAppend('<h2>wacky-tracky <span class = "dropdown">&#x25bc;</span></h2>');
	this.domLists = this.dom.createAppend('<ul class = "lists" />');
	this.domTags = this.dom.createAppend('<ul class = "tags" />');
	this.domButtonNewList = this.dom.createAppend('<button>New List</button>').click(function() { self.createList(); });
	this.domButtonNewTag = this.dom.createAppend('<button>New Tag</button>').click(function() { self.createTag(); });
	this.domButtonRefresh = this.dom.createAppend('<button class = "refresh" />').html('&nbsp;').click(function() { self.refreshLists(); })
	this.domButtonRaiseIssue = this.dom.createAppend('<button id = "raiseIssue">Issue!</button>').click(function() { window.open("http://github.com/wacky-tracky/wacky-tracky-client-html5/issues/new") });
	this.domButtonRaiseIssue.css('color', 'darkred').css('font-weight', 'bold');

	menuUser = new Menu();
	menuUser.addItem('Change password', changePassword);
	menuUser.addItem('Logout', logoutRequest);
	menuUser.addTo(this.domTitle);

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
			ret += '.tag' + tag.id + '.selected, .tag' + tag.id + ':hover { background-color: #' + getNextTagColor() + ' !important }' + "\n";
			self.addTag(new Tag(tag));
		});

		$('body').append($('<style type = "text/css">' + ret + '</style>'));
		sidepanelResized();
	};

	SidePanel.prototype.renderLists = function(lists) {
		self.clear();

		$(lists).each(function(index, list) {
			self.addList(new List(list));
		});

		sidepanelResized();

		if (self.lists.length > 0) {
			self.lists[0].select();
		}
	};

	SidePanel.prototype.hide = function() {
		this.dom.hide();
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
	if (window.selectedItem !== null) {
		if (e.keyCode == 27) {
			window.selectedItem.deselect();
		}

		if (e.keyCode == 46) {
			window.selectedItem.del();
		}

		if (e.keyCode == 113) {
				window.selectedItem.rename();
		}

		if (e.keyCode == 40) {
			window.content.list.nextSelect();
		}

		if (e.keyCode == 38) {
			window.content.list.prevSelect();
		}
	}

	if (window.currentMenu != null) {
		if (e.keyCode == 27) {
			window.currentMenu.hide();
		}
	}

});
