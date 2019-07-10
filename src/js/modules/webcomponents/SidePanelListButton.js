import { isNarrowScreen } from "../../firmware/util.js"

export default class SidePanelListButton extends HTMLElement {
	setFields(list) {
		this.list = list;
	}

	setupComponents() {
		this.dom = document.querySelector('template#sidePanelListButton').content.cloneNode(true);
		this.appendChild(this.dom);

		this.domLink = this.querySelector("a")

		this.domSidePanelTitleText = this.querySelector("span.listTitle");
		this.domSidePanelTitleText.innerText = this.list.getTitle()

		this.domSidePanelTitleSuffix = this.querySelector("span.subtle");
		this.domSidePanelTitleSuffix.innerText = this.list.getCountItems()
	}

	setSuffixText(text) {
		this.domSidePanelTitleSuffix.innerText = text;
	}

	setListCallback(mdlList, list) {
		this.setCallback(() => {
			if (window.selectedItem != null) {
				window.selectedItem.deselect();
			}

			if (isNarrowScreen()) {
				window.sidepanel.toggle();
			}

			document.title = mdlList.getTitle();

			window.sidepanel.selectedItem = list;
			list.select();

			// We have to set the hash on a menu item click, not on 
			// content.setList or similar, otherwise the hash gets reset on 
			// page load, and other events that cause the list to change.
			window.location.hash = mdlList.getTitle();
		});
	}

	setCallback(callback) {
		this.callback = callback;

		this.domLink.addEventListener("click", this.callback);
	}

	select() {
		this.classList.add("selected");
	}

	deselect() {
		this.classList.remove("selected");
	}
}

window.customElements.define("side-panel-list-button", SidePanelListButton)
