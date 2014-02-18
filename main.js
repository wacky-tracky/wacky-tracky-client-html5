window.host = "http://" + window.location.hostname + ":8082/"

function Tag(tagObject) {
	this.obj = tagObject;

	var self = this;

	this.domButtonSet = $('<button>').text(this.obj.title);
	this.domSidebar = $('<li>').text(this.obj.title);

	Tag.prototype.toDomSidebar = function() {
		return this.domSidebar;
	};
}

function Task(taskObject) {
	var self = this;
	this.parent = null;
	this.fields = taskObject;

	this.dom = $('<div class = "taskWrapper" />')
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
		$.ajax({
			url: window.host + '/listTasks',
			data: { task: this.fields.id },
			success: this.renderSubtasks
		})
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

		$(window.sidebar.tags).each(function(i, tag) {
			button = self.domTask.createAppend('<button class = "tag" />').addClass('tag' + tag.obj.id).text(tag.obj.title)
			button.click(function() {
				self.tagItem(tag);
			});
		});
	};

	Task.prototype.tagItem = function(tag) {
		$.ajax({
			url: window.host + 'tag',
			data: {
				item: this.fields.id,
				tag: tag.obj.id
			},
		});

		this.toggleTag(tag.obj.id);
	};

	Task.prototype.toggleTag = function(id) {
		tag = this.domTask.children('.tag' + id)
		
		if (tag.hasClass('selected')) {
			tag.removeClass('selected');
		} else {
			tag.addClass('selected');
		}
	};

	Task.prototype.closeEditDialog = function() {
		this.dom.children('.editDialog').remove();
		this.domEditDialog = null;
	}

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

		$.ajax({
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

function init() {
	window.selectedItem = null;

	window.sidebar = new Sidebar();
	$('body').append(window.sidebar.toDom());

	window.sidebar.refreshLists();
	window.sidebar.refreshTags();

	window.content = new Content();
	$('body').append(window.content.toDom());

	sidebarResized();
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
	if (text == null || text == "") {
		return;
	};

	$('input#task').val('');

	data = { content: text }

	if (window.selectedItem === null) {
		data.parentId = window.content.list.fields.id;
		data.parentType = 'list';
	} else {
		data.parentId = window.selectedItem.fields.id;
		data.parentType = 'task';
	}

	$.ajax({
		url: window.host + 'createTask',
		success: renderTaskCreated,
		data: data
	});
}

function renderTaskCreated(task) {
	if (window.selectedItem == null) {
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
		if (label != '') {
			label += ': ' 
		}

		this.domLabel.text(label);
		this.domInput.width(this.dom.width() - this.domLabel.width() - 20);
	};

	return this;
}


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

function generalError(msg, errorText) {
	console.log("error", msg, errorText);
	console.log(new Error().stack);
	$('body').createAppend($('<div class = "notification">').text('Error: ' + errorText)).click(function() {
		this.remove();	
	});
}

function requestTasks(list) {
	window.content.setList(list);

	$.ajax({
	url: window.host + '/listTasks',
		data: { list: list.fields.id },
		success: renderTasks,
		error: generalError
	});
}

function ListControls(list) {
	this.list = list;

	var self = this;

	this.dom = $('<div class = "buttonToolbar listControls" />')
	this.dom.model(this);
	this.domLabel = this.dom.createAppend('<span />').text(this.list.fields.title);
	this.domButtonDelete = this.dom.createAppend('<button />').text("Delete");
	this.domButtonDelete.click(function (e) { self.del(); });

	ListControls.prototype.del = function() {
		this.list.del();
	}

	ListControls.prototype.toDom = function() {
		return this.dom;
	}

	return this;
}

function List(jsonList) {
	this.fields = jsonList;

	this.domSidebar = $('<li class = "list" />');
	this.domSidebar.model(this);
	this.domSidebarTitle = this.domSidebar.createAppend('<a href = "#" class = "listTitle" />').text(this.fields.title);
	this.domSidebarTitleSuffix = this.domSidebarTitle.createAppend('<span class = "subtle" />');

	this.domList = $('<ul id = "taskList" />');

	this.tasks = [];

	var self = this;

	this.updateTaskCount = function(newCount) {
		if (newCount == null) {
			newCount = this.tasks.length;
		}

		this.domSidebarTitleSuffix.text(newCount);
	};

	this.domSidebarTitle.click(function(e) {
		self.select();
	});

	List.prototype.select = function() {
		requestTasks(this);

		window.sidebar.deselectAll();
		this.domSidebar.addClass('selected');
	};

	List.prototype.toDomSidebar = function () {
		return this.domSidebar;
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
		this.domSidebar.removeClass('selected');
	};

	List.prototype.clear = function() {
		this.domList.children().remove();
		this.tasks.length = 0;
	};

	List.prototype.del = function() {	
		$.ajax({
			url: window.host + 'deleteList',
			data: { id: this.fields.id },
			success: window.sidebar.refreshLists()
		})
	};

	this.updateTaskCount(this.fields.count);

	return this;
}

function sidebarResized() {
	window.content.dom.css('left', window.sidebar.dom.css('width'));
	window.content.dom.css('right', $('body').css('width'));
}

function Sidebar() {
	var self = this;

	this.dom = $('<div id = "sidebar" />');
	this.dom.model(this);
	this.dom.resizable({ minWidth: 200, handles: 'e', resize: sidebarResized});
	this.domTitle = this.dom.createAppend('<h2>wacky-tracky</h2>');
	this.domLists = this.dom.createAppend('<ul class = "lists" />');
	this.domTags = this.dom.createAppend('<ul class = "tags" />');
	this.domButtonNewList = this.dom.createAppend('<button>New List</button>').click(function() { self.createList(); });
	this.domButtonNewTag = this.dom.createAppend('<button>New Tag</button>').click(function() { self.createTag(); });

	this.lists = [];
	this.tags = [];

	Sidebar.prototype.createTag = function() {
		var title = window.prompt("Tag name?");

		if (title == "" || title == null) {
			return;
		}

		$.ajax({
			url: window.host + '/createTag',
			data: {
				title: title
			},
			success: this.refreshTags
		});
	};

	Sidebar.prototype.createList = function() {
		var title = window.prompt("List name?");

		if (title == "" || title == null) {
			return;
		}

		$.ajax({
			url: window.host + '/createList',
			data: {
				title: title
			},
			success: this.refreshLists
		});

	}

	Sidebar.prototype.addList = function(list) {
		this.domLists.append(list.toDomSidebar());
		this.lists.push(list);
	};

	Sidebar.prototype.addTag = function(tag) {
		this.domTags.append(tag.toDomSidebar());
		this.tags.push(tag);
	};

	Sidebar.prototype.toDom = function() {
		return this.dom;
	};

	Sidebar.prototype.clear = function() {
		this.domLists.children().remove();
		this.lists.length = 0;
	}

	Sidebar.prototype.deselectAll = function() {
		$(this.lists).each(function(index, list) {
			list.deselect();
		});
	};

	Sidebar.prototype.refreshLists = function() {
		$.ajax({
			url: window.host + '/listLists',
			success: this.renderLists
		})
	};

	Sidebar.prototype.refreshTags = function() {
		$.ajax({
			url: window.host + 'listTags',
			success: this.renderTags
		});
	};

	Sidebar.prototype.renderTags = function(tags) {
		$(tags).each(function(index, tag) {
			self.addTag(new Tag(tag));
		});
	};

	Sidebar.prototype.renderLists = function(lists) {
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

$(document).keyup(function(e) {
	if (e.keyCode == 27) {
		if (window.selectedItem != null) {
			window.selectedItem.deselect();
		}
	}

	if (e.keyCode == 46) {
		if (window.selectedItem != null) {
			window.selectedItem.del();
		}
	}
});
