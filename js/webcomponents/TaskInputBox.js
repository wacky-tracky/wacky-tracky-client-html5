export default class TaskInputBox extends HTMLDivElement {
	setupComponents() {
		this.label = null;

		this.domLabel = document.createElement('span');
		this.appendChild(this.domLabel)

		this.domInput = document.createElement('input');
		this.domInput.id = "task"
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
		this.domInput.disabled = false;;
		this.domInput.focus();
	};
	
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

document.registerElement("task-input-box", TaskInputBox)
