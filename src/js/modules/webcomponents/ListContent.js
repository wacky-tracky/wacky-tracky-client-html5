import "./TaskContent.js"

import { ajaxRequest } from "../../firmware/middleware.js"

export default class ListContent extends HTMLElement {
	setList(mdlList) {
		this.list = mdlList
	}

	setupComponents(menuItem) {
		this.sidePanelMenuItem = menuItem;
/*
		this.domDialog = $('<p><small>Note: your changes will be automatically saved when you close this dialog.</small></p>');
		this.domInputTitle = this.domDialog.createAppend('<p>Title:</p>').createAppend('<input />').text(this.list.title);
		this.domInputSort = this.domDialog.createAppend('<p>Sort:</p>').createAppend('<select />');
		this.domInputSort.createAppend('<option value = "title">Title</option>');
		this.domInputSort.createAppend('<option value = "dueDate">Due Date</option>');

		this.domShowTimeline = this.domDialog.createAppend('<p>Timeline:</p>').createAppend('<input type = "checkbox" />');

*/
		this.domList = document.createElement("ul");
		this.domList.id = "taskList"
		this.appendChild(this.domList);
	}

	getId() {
		return this.list.id;
	}

	getCountItems() {
		return this.list.countItems;
	}

	getTitle() {
		return this.list.title;
	}

	openDialog() {
		this.domInputTitle.val(this.list.title);
		this.domInputSort.val(this.list.sort);
		this.domShowTimeline.val(this.list.timeline);

		this.domDialog.dialog({
			title: "List options",
			close: function() {
				ajaxRequest({
					url: 'listUpdate',
					data: {
						list: this.list.id,
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
			data: { id: this.list.id },
			success: window.uimanager.fetchLists
		});
	}

	requestTasks() {
		ajaxRequest({
			url: 'listTasks',
			data: { 
				list: this.list.id,
				sort: this.list.sort
			},
			success: this.addAll.bind(this)
		});
	}


}

window.customElements.define("list-stuff", ListContent)
