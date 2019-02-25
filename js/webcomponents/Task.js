function Task(taskObject) {
	var self = this;
	this.parent = null;
	this.fields = taskObject;

	this.dom = $('<div class = "taskWrapper" />');
	this.domTask = this.dom.createAppend('<div class = "task" />');
	this.domTask.click(function() { self.select(); });
	this.domTask.dblclick(function() { self.openEditDialog(); });
	this.domButtonExpand = this.domTask.createAppend('<button class = "expand" disabled = "disabled">&nbsp;</button>').click(function() { self.toggleSubtasks(); });
	this.domTaskContent = this.domTask.createAppend('<span class = "content" />').text(this.fields.content);
	this.domTaskControls = this.domTask.createAppend('<div class = "controls" />');
	this.domTaskButtons = this.domTaskControls.createAppend('<div class = "taskButtons" />');
	this.domButtonDueDate = this.domTaskButtons.createAppend('<input />').disable();
	this.domButtonDelete = this.domTaskButtons.createAppend('<button>delete</button>');
	this.domButtonDelete.click(function() { self.del(); });
	this.domButtonDelete.css('display', 'none');
	this.domButtonTags = this.domTaskButtons.createAppend('<button>Tag </button>');

	this.menuTags = new Menu('tag menu');
	this.menuTags.domItems.addClass('tagsMenu');
	this.menuTags.dropDown = true;
	this.menuTags.addTo(this.domButtonTags);
	
	this.domEditDialog = null;
	
	this.domSubtasks = this.dom.createAppend('<div class = "subTasks" />');
	this.domSubtasks.css('display', 'none');

	this.subtasks = [];

	Task.prototype.isSubtasksVisible = function() {
		return this.domSubtasks.css('display') == 'block';
	};

	Task.prototype.setSubtasksVisible = function(visible) {
		if (visible) {
			this.refreshSubtasks();
			this.domSubtasks.css('display', 'block') ;
		} else {
			this.domSubtasks.css('display', 'none') ;
		}

		this.refreshExpandButton();
	};

	Task.prototype.toggleSubtasks = function() {
		this.setSubtasksVisible(!this.isSubtasksVisible());
	};

	Task.prototype.refreshExpandButton = function(forceEnabled) {
		if (forceEnabled || this.subtasks.length > 0) {
			if (this.isSubtasksVisible()) {
				this.domButtonExpand.text('-');
			} else {
				this.domButtonExpand.text('+');
			}

			this.domButtonExpand.removeAttr('disabled');
		} else {
			this.domButtonExpand.attr('disabled', 'disabled');
			this.domButtonExpand.html('&nbsp;');
		}
	};

	Task.prototype.refreshSubtasks = function() {
		this.domSubtasks.children().remove();
		ajaxRequest({
			url: '/listTasks',
			data: { 
				task: this.fields.id,
				sort: window.content.list.fields.sort
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
			title = tag.obj.shortTitle;

			if (title == "" || title == null) {
				title = tag.obj.title;
			}

			self.menuTags.addItem(title, function() {
				self.tagItem(tag);
			}).addClass('tag' + tag.obj.id).addClass('tagTitle');
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
		
		if (tagEl.hasClass('selected')) {
			tagEl.removeClass('selected');

			this.domButtonTags.children('.tag' + tag.id).remove();
		} else {
			tagEl.addClass('selected');

			this.domButtonTags.createAppend('<span class = "tag indicator tag' + tag.id + '">&nbsp;&nbsp;&nbsp;&nbsp;</span> ');
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
		this.refreshExpandButton();
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

		ajaxRequest({
			url: 'renameItem',
			data: {
				'id': this.fields.id,
				'content': newContent,
			}
		});
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
		this.menuTags.hide();
	};

	Task.prototype.del = function(i) {
		if (window.selectedItem.isBeingRenamed) {
			return;
		}

		window.selectedItem.deselect();

		window.toDelete = this;

		ajaxRequest({
			url: 'deleteTask',
			data: { id: this.fields.id },
			success: this.renderDelete
		});
	};

	Task.prototype.renderDelete = function() {
		window.toDelete.dom.remove();
		window.content.list.tasks.pop(window.toDelete);
		window.content.list.updateTaskCount();

		if (window.toDelete.parent != null) {
			if (window.toDelete instanceof Task) {
				parent = window.toDelete.parent;

				parent.subtasks.pop(window.toDelete);
				parent.refreshExpandButton();
			}
		}

		window.toDelete = null;
	};

	Task.prototype.hasTags = function() {
		// this should not rely on the dom, but when you toggleTag() we don't have the tag object to update this.tags with.
		return this.domButtonTags.children().size() > 0; 
	};

	if (this.fields.hasChildren) {
		this.refreshExpandButton(true);
	}

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

