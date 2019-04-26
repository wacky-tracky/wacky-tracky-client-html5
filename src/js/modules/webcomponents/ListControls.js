import './ListEditor.js'

export default class ListControls extends HTMLElement {
	setupComponents() {
		this.appendChild(document.querySelector('#listControls').content.cloneNode(true))

		this.domLabel = this.querySelector("h3");
		this.domButtonDelete = this.querySelector("#delete");
		this.domButtonSettings = this.querySelector("#settings");
		this.domButtonSettings.onclick = () => {
			let ed = document.createElement("list-editor");	
			ed.setList(this.listId);

			window.content.setTab(ed);
		}

		this.domButtonMore = this.querySelector("#more")

		this.menuMore = document.createElement("popup-menu")
		this.menuMore.setFields("list options")
		this.menuMore.addItem("Download (JSON)", () => { this.requestDownload("json") })
		this.menuMore.addItem("Download (Text)", () => { this.requestDownload("text") });
		this.menuMore.addItem("Download (CSV)", () => { this.requestDownload("csv") });
		this.menuMore.addItem("Copy as spreadsheet", () => { this.requestCopyAsSpreadsheet() });
		this.menuMore.addTo(this.domButtonMore);
	}

	setList(list) {
		this.listId = list.fields.id;

		this.domLabel.innerText = list.fields.title;

		this.domButtonDelete.onclick = () => { list.del() };
	}

	copyAsSpreadsheet() {
	}

	requestDownload(format) {
		window.location = window.host + 'listDownload?id=' + this.listId + '&format=' + format
	}

/**
		ListControls.prototype.showSettings = function() {
			this.list.openDialog();
		};
	*/
}

window.customElements.define("list-controls", ListControls)
