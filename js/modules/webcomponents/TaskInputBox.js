export default class TaskInputBox extends HTMLElement {
	setupComponents() {
		this.label = null;

		this.domLabel = document.createElement('span');
		this.domLabel.classList.add("taskInputPrefix");
		this.setPrefix();
		this.appendChild(this.domLabel)

		this.domInput = document.createElement('input');
		this.domInput.id = "task"
		this.domInput.setAttribute("aria-label", 'Create new task')
		this.domInput.setAttribute("accesskey", 'c')
		this.domInput.setAttribute("tabindex", '0')
		this.domInput.setAttribute("autofocus", true)
		this.domInput.value = ""
		this.domInput.disabled = true;
		this.appendChild(this.domInput);

		this.prepend(window.sidepanel.getToggleButton());

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

	setPrefix(prefix) {
		if (prefix == null) {
			prefix = "Create";
		}

		if (prefix == "Create") {
			prefix = "&#127381;";
		}

		if (prefix == "Search") {
			prefix = "&#128270;";
		}

		this.domLabel.innerHTML = prefix;
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
