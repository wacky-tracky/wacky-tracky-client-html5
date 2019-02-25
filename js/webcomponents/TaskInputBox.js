function TaskInputBox(label) {
	this.label = null;

	this.dom = $('<div class = "itemInput" />');
	this.domLabel = this.dom.createAppend('<span />');
	this.domSidepanelIcon = this.dom.createAppend(window.sidepanelIcon.dom);
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

