export default class SidePanelListButton extends HTMLDivElement {
	setFields(list) {
		this.list = list;
		this.listTitle = list.getTitle()
	}

	setupComponents() {
		this.dom = document.createElement("li")

		this.domSidePanelTitle = document.createElement("a")
		this.domSidePanelTitle.classList.add("listTitle");
		this.dom.appendChild(this.domSidePanelTitle);

		this.domSidePanelTitleText = document.createElement("span");
		this.domSidePanelTitleText.classList.add("listCaption")
		this.domSidePanelTitleText.innerText = this.listTitle
		this.domSidePanelTitle.appendChild(this.domSidePanelTitleText)

		this.domSidePanelTitleSuffix = document.createElement("span");
		this.domSidePanelTitleSuffix.classList.add("subtle")
		this.domSidePanelTitleSuffix.innerText = this.list.getCountItems()
		this.domSidePanelTitle.appendChild(this.domSidePanelTitleSuffix);

		this.appendChild(this.dom);
	}

	setSuffixText(text) {
		this.domSidePanelTitleSuffix.innerText = text;
	}

	setListCallback(list) {
		this.setCallback(() => {
			if (window.selectedItem != null) {
				window.selectedItem.deselect();
			}

			window.sidepanel.selectedItem.deselect();
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
		this.dom.classList.add("selected");
	}

	deselect() {
		this.dom.classList.remove("selected");
	}
}

document.registerElement("side-panel-list-button", SidePanelListButton);
