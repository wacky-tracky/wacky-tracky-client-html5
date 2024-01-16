import { newTask } from "../../firmware/util.js"

export class TaskInputBox extends HTMLElement {
  setupComponents() {
    this.label = null;

    this.setAttribute("role", "none");

    this.dom = document.createElement("header");
    this.dom.title = "Task Input Header";
    this.appendChild(this.dom);

    this.domLabel = document.createElement('label');
    this.domLabel.title = "Task type";
    this.domLabel.setAttribute('style', 'min-width: auto;');
    this.domLabel.classList.add("taskInputPrefix");
    this.setPrefix();
    this.dom.appendChild(this.domLabel)

    this.domInput = document.createElement('input');
    this.domInput.id = "task"
    this.domInput.setAttribute("title", 'New task contents')
    this.domInput.setAttribute("accesskey", 'c')
    this.domInput.setAttribute("tabindex", '0')
    this.domInput.value = ""
    this.domInput.disabled = true;
    this.dom.appendChild(this.domInput);

    this.dom.prepend(window.sidepanel.getToggleButton());

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
  }

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
  }

  clear() {
    this.domInput.value = "";
  }
}

window.customElements.define("task-input-box", TaskInputBox)
