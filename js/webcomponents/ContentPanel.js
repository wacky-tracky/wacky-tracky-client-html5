import TaskInputBox from "./TaskInputBox.js"
import ListControls from "./ListControls.js"

export default class ContentPanel extends HTMLDivElement {
	setupComponents() {
		this.taskInput = document.createElement("task-input-box");
		this.taskInput.setupComponents();
		this.appendChild(this.taskInput)

		this.domListContainer = document.createElement('list-container');
		this.appendChild(this.domListContainer);
	}

	setList(list) {
		window.selectedItem = null;

		this.list = list;
		
		while (this.domListContainer.hasChildNodes()) {
			this.domListContainer.firstChild.remove();
		}

		//$('.tagsMenu').remove();
		//$('.listControlsMenu').remove();
		this.domListContainer.appendChild(list);

		let listControls = document.createElement("list-controls")
		listControls.setupComponents();
		listControls.setList(list);

		this.domListContainer.append(listControls);

		this.taskInput.enable();
	}
}

document.registerElement("content-panel", ContentPanel)
