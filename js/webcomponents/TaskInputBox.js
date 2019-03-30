export default class TaskInputBox extends HTMLElement {
	setupComponents() {
		this.label = null;

		this.domLabel = document.createElement('span');
		this.appendChild(this.domLabel)

		this.domInput = document.createElement('input');
		this.domInput.id = "task"
		this.domInput.setAttribute("aria-label", 'Create new task')
		this.domInput.setAttribute("tabindex", '0')
		this.domInput.setAttribute("autofocus", true)
		this.domInput.value = ""
		this.domInput.disabled = true;
		this.appendChild(this.domInput);


		this.domInput.onkeypress = (e) => {
			var key = e.keyCode ? e.keyCode : e.which;

			if (key == 13) {
				newTask(this.domInput.value, window.content.list.getId());
			}
		};

		this.domInput.onfocus = () => {
			this.domInput.value = ""
		}

		this.domInput.onblur = () => {
			this.domInput.value = this.label
		}
	}
	
	enable() {
		this.domInput.disabled = false;
		this.domInput.focus();
	};

	disable() {
		this.domInput.disabled = true;
	}
	
	setLabel(label) {
		if (label == "") {
			this.label = "";
		} else {
			this.label = "Click to add subtask of: " + label;
		}

		this.domInput.value = this.label
	};

	clear() {
		this.domInput.value = "";
	}
}

window.customElements.define("task-input-box", TaskInputBox)
