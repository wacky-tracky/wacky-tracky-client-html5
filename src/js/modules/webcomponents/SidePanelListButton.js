import { isNarrowScreen } from "../../firmware/util.js"

export default class SidePanelListButton extends HTMLElement {
	setFields(list) {
		this.list = list;
		this.listTitle = list.getTitle()
	}

	setupComponents() {
		this.domSidePanelTitle = document.createElement("a")
		this.domSidePanelTitle.setAttribute("href", "#");
		this.domSidePanelTitle.classList.add("listMenuLink");
		this.appendChild(this.domSidePanelTitle);

		this.domSidePanelTitleText = document.createElement("span");
		this.domSidePanelTitleText.classList.add("listTitle")
		this.domSidePanelTitleText.innerText = this.listTitle
		this.domSidePanelTitle.appendChild(this.domSidePanelTitleText)

		this.domSidePanelTitleSuffix = document.createElement("span");
		this.domSidePanelTitleSuffix.classList.add("subtle")
		this.domSidePanelTitleSuffix.innerText = this.list.getCountItems()
		this.domSidePanelTitle.appendChild(this.domSidePanelTitleSuffix);
	}

	setSuffixText(text) {
		this.domSidePanelTitleSuffix.innerText = text;
	}

	setListCallback(list) {
		this.setCallback(() => {
			if (window.selectedItem != null) {
				window.selectedItem.deselect();
			}

			if (isNarrowScreen()) {
				window.sidepanel.toggle();
			}

			document.title = list.fields.title;

			window.sidepanel.selectedItem = list;
			list.select();

			// We have to set the hash on a menu item click, not on 
			// content.setList or similar, otherwise the hash gets reset on 
			// page load, and other events that cause the list to change.
			window.location.hash = list.getTitle();
		});
	}

	setCallback(callback) {
		this.callback = callback;

		this.domSidePanelTitle.addEventListener("click", this.callback);
	}

	select() {
		this.classList.add("selected");
	}

	deselect() {
		this.classList.remove("selected");
	}
}

window.customElements.define("side-panel-list-button", SidePanelListButton)
