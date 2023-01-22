import { TaskInputBox} from "./TaskInputBox.js"
import { ListControls } from "./ListControls.js"

export class ContentPanel extends HTMLElement {
	setupComponents() {
		this.title = "Content Panel";
		this.setAttribute("role", "region");

		this.taskInput = document.createElement("task-input-box");
		this.taskInput.setupComponents();
		this.appendChild(this.taskInput)

		this.domView = document.createElement('main');
		this.domView.title = "Currently selected list contents";
		this.appendChild(this.domView);

		this.newMessage = document.createElement("div");
		this.newMessage.classList.add("centeredMessage");
		this.newMessage.setAttribute("role", "note");
		this.newMessage.title = "Currently selected list description";
		this.newMessage.innerText = "No list selected.";
		this.domView.appendChild(this.newMessage);
	}

	setList(list) {
		this.newMessage.remove();

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
