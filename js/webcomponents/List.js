function List(jsonList) {
	this.fields = jsonList;

	this.domSidePanel = $('<li class = "list" />');
	this.domSidePanel.model(this);
	this.domSidePanelTitle = this.domSidePanel.createAppend('<a href = "#" class = "listTitle" />')
	this.domSidePanelTitleText = this.domSidePanelTitle.createAppend('<span class = "listCaption" />').text(this.fields.title);
	this.domSidePanelTitleSuffix = this.domSidePanelTitle.createAppend('<span class = "subtle" />');

	this.domDialog = $('<p><small>Note: your changes will be automatically saved when you close this dialog.</small></p>');
	this.domInputTitle = this.domDialog.createAppend('<p>Title:</p>').createAppend('<input />').text(this.fields.title);
	this.domInputSort = this.domDialog.createAppend('<p>Sort:</p>').createAppend('<select />');
	this.domInputSort.createAppend('<option value = "title">Title</option>');
	this.domInputSort.createAppend('<option value = "dueDate">Due Date</option>');

	this.domShowTimeline = this.domDialog.createAppend('<p>Timeline:</p>').createAppend('<input type = "checkbox" />');

	this.domList = $('<ul id = "taskList" class = "foo" />');

	this.tasks = [];

	var self = this;

	List.prototype.openDialog = function() {
		var self = this;

		this.domInputTitle.val(this.fields.title);
		this.domInputSort.val(this.fields.sort);
		this.domShowTimeline.val(this.fields.timeline);

		this.domDialog.dialog({
			title: "List options",
			close: function() {
				ajaxRequest({
					url: 'listUpdate',
					data: {
						list: self.fields.id,
						title: self.domInputTitle.val(),
						sort: self.domInputSort.val(),
						timeline: self.domShowTimeline.val(),
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
		task.parent = this;
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

	List.prototype.clear = function() {
		this.domList.children().remove();
		this.tasks.length = 0;
	};

	List.prototype.del = function() {	
		ajaxRequest({
			url: 'deleteList',
			data: { id: this.fields.id },
			success: window.sidepanel.refreshLists
		});
	};

	this.updateTaskCount(this.fields.count);

	return this;
}

