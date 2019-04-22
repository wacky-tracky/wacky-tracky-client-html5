import TaskInputBox from "./TaskInputBox.js"
import ListControls from "./ListControls.js"

export default class ContentPanel extends HTMLElement {
	setupComponents() {
		this.taskInput = document.createElement("task-input-box");
		this.taskInput.setupComponents();
		this.appendChild(this.taskInput)

		this.domView = document.createElement('main');
		this.appendChild(this.domView);
	}

	setList(list) {
		window.selectedItem = null;

		this.clear()

		this.list = list;

		this.domView.appendChild(list);
		
		let listControls = document.createElement("list-controls")
		listControls.setupComponents();
		listControls.setList(list);

		this.domView.appendChild(listControls);

		this.taskInput.enable();
	}

	setTab(tab) {
		this.clear()

		this.domView.appendChild(tab);
		this.taskInput.disable();
	}

	clear() {
		while (this.domView.hasChildNodes()) {
			this.domView.firstChild.remove();
		}
	}
}

window.customElements.define("content-panel", ContentPanel)
