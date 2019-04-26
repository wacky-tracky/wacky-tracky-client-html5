import "./Task.js"

import { ajaxRequest } from "../../firmware/middleware.js"

export default class List extends HTMLElement {
	setFields(fields) {
		this.fields = fields
	}

	setupComponents(menuItem) {
		this.sidePanelMenuItem = menuItem;
/*
		this.domDialog = $('<p><small>Note: your changes will be automatically saved when you close this dialog.</small></p>');
		this.domInputTitle = this.domDialog.createAppend('<p>Title:</p>').createAppend('<input />').text(this.fields.title);
		this.domInputSort = this.domDialog.createAppend('<p>Sort:</p>').createAppend('<select />');
		this.domInputSort.createAppend('<option value = "title">Title</option>');
		this.domInputSort.createAppend('<option value = "dueDate">Due Date</option>');

		this.domShowTimeline = this.domDialog.createAppend('<p>Timeline:</p>').createAppend('<input type = "checkbox" />');

*/
		this.domList = document.createElement("ul");
		this.domList.id = "taskList"
		this.domList.classList.add("foo")
		this.appendChild(this.domList);
	}

	getId() {
		return this.fields.id;
	}

	getCountItems() {
		return this.fields.countItems;
	}

	getTitle() {
		return this.fields.title;
	}

	openDialog() {
		this.domInputTitle.val(this.fields.title);
		this.domInputSort.val(this.fields.sort);
		this.domShowTimeline.val(this.fields.timeline);

		this.domDialog.dialog({
			title: "List options",
			close: function() {
				ajaxRequest({
					url: 'listUpdate',
					data: {
						list: this.fields.id,
						title: this.domInputTitle.val(),
						sort: this.domInputSort.val(),
						timeline: this.domShowTimeline.val(),
					}
				});
			}
		});
	}

	updateTaskCount() {
		let newCount = this.domList.children.length;

		this.sidePanelMenuItem.setSuffixText(newCount)
	}

	select() {
		this.requestTasks(this);
		window.content.setList(this);

		window.sidepanel.deselectAll();
		this.sidePanelMenuItem.select();
	}

	addAll(tasks) {
		this.clear();

		tasks.forEach((item) => {	
			let task = document.createElement("task-item")
			task.setFields(item);
			task.setupComponents();

			this.add(task);
		});
		
		this.updateTaskCount();
	}

	add(task) {
		let li = document.createElement("li");
		li.append(task);
		this.domList.append(li);

		this.updateTaskCount();
	}

	deselect() {
		this.sidePanelMenuItem.deselect()
	}

	clear() {
		while (this.domList.hasChildNodes()) {
			this.domList.firstChild.remove()
		}
	}

	del() {	
		ajaxRequest({
			url: 'deleteList',
			data: { id: this.fields.id },
			success: window.uimanager.fetchLists
		});
	}

	requestTasks() {
		ajaxRequest({
			url: 'listTasks',
			data: { 
				list: this.fields.id,
				sort: this.fields.sort
			},
			success: this.addAll.bind(this)
		});
	}


}

window.customElements.define("list-stuff", List)
