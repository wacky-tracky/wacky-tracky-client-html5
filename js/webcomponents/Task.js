import PopupMenu from './PopupMenu.js';

export default class Task extends HTMLDivElement {
	setFields(taskObject) {
		this.fields = taskObject;
	}

	setupComponents() {
		this.dom = document.createElement("div")
		this.dom.classList.add("taskWrapper");
		this.appendChild(this.dom);
		
		this.domTask = document.createElement("div")
		this.domTask.classList.add("task");
		this.dom.appendChild(this.domTask)

		this.domTask.addEventListener("click", () => { this.select() });

		/*
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
		*/
		
		this.domEditDialog = null;
		
		this.domButtonExpand = document.createElement("button");
		this.domButtonExpand.classList.add("expand")
		this.domButtonExpand.disabled = true;
		this.domButtonExpand.onclick = () => { this.toggleSubtasks() }
		this.domTask.appendChild(this.domButtonExpand);

		this.domTaskContent = document.createElement("span")
		this.domTaskContent.classList.add("content");
		this.domTaskContent.innerText = this.fields.content;
		this.domTaskContent.setAttribute("title", "ID:" + this.fields.id);
		this.domTask.appendChild(this.domTaskContent);

		this.domTaskButtons = document.createElement("div")
		this.domTaskButtons.classList.add("taskButtons")
		this.domTask.appendChild(this.domTaskButtons);

		this.domButtonTags = document.createElement("button")
		this.domButtonTags.innerText = "Tag"
		this.domTaskButtons.appendChild(this.domButtonTags);

		this.menuTags = document.createElement("popup-menu")
		this.menuTags.setFields("task menu");
		this.menuTags.domItems.classList.add('tagsMenu');
		this.menuTags.dropDown = true;
		this.menuTags.addTo(this.domButtonTags);
	
		this.domSubTasks = document.createElement("div");
		this.domSubTasks.classList.add("subTasks");
		this.domSubTasks.hidden = true;
		this.dom.appendChild(this.domSubTasks);

		this.subtasks = [];

		this.setup2();
	}

	isSubtasksVisible() {
		return !this.domSubTasks.hidden
	}

	setSubtasksVisible(visible) {
		if (visible) {
			this.refreshSubtasks();
			this.domSubTasks.hidden = false;
		} else {
			this.domSubTasks.hidden = true;
		}

		this.refreshExpandButton();
	};

	toggleSubtasks() {
		this.setSubtasksVisible(!this.isSubtasksVisible());
	};

	refreshExpandButton(forceEnabled) {
		if (forceEnabled || this.subtasks.length > 0) {
			if (this.isSubtasksVisible()) {
				this.domButtonExpand.innerText = '-';
			} else {
				this.domButtonExpand.innerText = '+';
			}

			this.domButtonExpand.disabled = false;
		} else {
			this.domButtonExpand.disabled = true;
			this.domButtonExpand.innerHTML = '&nbsp;';
		}
	};

	refreshSubtasks() {
		for (let child of this.domSubTasks.children) {
			child.remove();	
		}

		ajaxRequest({
			url: '/listTasks',
			data: { 
				task: this.fields.id,
				sort: window.content.list.fields.sort
			},
			success: this.renderSubtasks
		});
	};

	renderSubtasks(subtasks) {
		for (let subtask of subtasks) {
			let t = document.createElement("task-item");
			t.setFields(subtask)
			t.setupComponents()

			window.selectedItem.addSubtask(t);
		}
	};

	setDueDate(newDate) {
		if (newDate == null) {
			//newDate = self.fields.dueDate;
		}

		if (newDate == null) {
			newDate = "";
		}

		if (newDate != "") {
			newDate = "Due: " + newDate;
		} else {
			newDate = "no due date"
		}

		//self.domButtonDueDate.val(newDate);
	};

	openEditDialog() {
		this.closeEditDialog();

		this.domEditDialog = $('<div class = "editDialog" />');
		this.domEditId = this.domEditDialog.createAppend('<span />').text('ID:' + this.fields.id);
	
		this.dom.append(this.domEditDialog).fadeIn();
		this.domEditDialog.slideDown();
	};

	addTagButtons() {
		this.menuTags.addItem("one", null);
		this.menuTags.addItem("two", null);
		this.menuTags.addItem("three", null);
/*
		$(window.sidepanel.tags).each(function(i, tag) {
			title = tag.obj.shortTitle;

			if (title == "" || title == null) {
				title = tag.obj.title;
			}

			self.menuTags.addItem(title, function() {
				self.tagItem(tag);
			}).addClass('tag' + tag.obj.id).addClass('tagTitle');
		});
*/
	};

	tagItem(tag) {
		ajaxRequest({
			url: '/tag',
			data: {
				item: this.fields.id,
				tag: tag.obj.id
			}
		});

		this.toggleTag(tag.obj);
	};

	toggleTag(tag) {
		tagEl = this.menuTags.domItems.children('.tag' + tag.id);
		
		if (tagEl.hasClass('selected')) {
			tagEl.removeClass('selected');

			this.domButtonTags.children('.tag' + tag.id).remove();
		} else {
			tagEl.addClass('selected');

			this.domButtonTags.createAppend('<span class = "tag indicator tag' + tag.id + '">&nbsp;&nbsp;&nbsp;&nbsp;</span> ');
		}
	};

	closeEditDialog() {
		return
		 
		this.dom.children('.editDialog').remove();
		this.domEditDialog = null;
	};

	addSubtask(t) {
		this.domSubTasks.append(t);
		this.subtasks.push(t);
		this.refreshExpandButton();
	};

	rename() {
		if (this.domTask.children('.renamer').length > 0) {
			this.domTask.children('.renamer').focus();
		} else {
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

	renameTo(newContent) {
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

	select() {
		if (window.selectedItem == this || window.toDelete == this) {
			return;
		}

		if (window.selectedItem !== null) {
			if (!window.selectedItem.deselect()) {
			}
		}

//		this.domButtonDelete.css('display', 'inline-block');
//		this.domButtonDueDate.model(this);
//		this.domButtonDueDate.datepicker({dateFormat: 'yy-mm-dd', onSelect: self.requestUpdateDueDate});
//		this.domButtonDueDate.removeAttr('disabled');

		window.content.taskInput.setLabel(this.fields.content);

		window.selectedItem = this;
		this.dom.classList.add('selected');
	};

	requestUpdateDueDate(newDate) {
		ajaxRequest({
			url: 'setDueDate',
			data: {
				"item": window.selectedItem.fields.id,
				"dueDate": newDate
			}
		});
	};

	deselect() {
		if (window.selectedItem.isBeingRenamed) {
			window.selectedItem.domTask.children('.renamer').focus().effect('highlight');
			return false;
		}

		this.closeEditDialog();

		window.selectedItem = null;
		this.dom.classList.remove('selected');

		//this.domButtonDueDate.attr('disabled', 'disabled');

		//this.domButtonDelete.css('display', 'none');

		if (!this.hasTags()) {
			this.domButtonTags.display = 'none';
		}

		window.content.taskInput.setLabel('');

		//this.domTask.children.querySelectorAll('.renamer').remove();
		//this.menuTags.hide();
	};

	del(i) {
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

	renderDelete() {
		window.toDelete.remove();
		window.content.list.updateTaskCount();

		/**
		if (window.toDelete.parent != null) {
			if (window.toDelete instanceof Task) {
				parent = window.toDelete.parent;

				parent.subtasks.pop(window.toDelete);
				parent.refreshExpandButton();
			}
		}
		*/

		window.toDelete = null;
	};

	hasTags() {
		// this should not rely on the dom, but when you toggleTag() we don't have the tag object to update this.tags with.
		return this.domButtonTags.children.length > 0; 
	};

	setup2() {
		if (this.fields.hasChildren) {
			this.refreshExpandButton(true);
		}

		this.setDueDate();
		this.addTagButtons()
		/*;
		$(this.fields.tags).each(function(i, tag) {
			self.toggleTag(tag);
		});

		if (!this.hasTags()) {
			this.domButtonTags.css('display', 'none');
		}
		*/
	}
}

document.registerElement("task-item", Task)