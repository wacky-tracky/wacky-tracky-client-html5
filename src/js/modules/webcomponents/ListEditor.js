import { ajaxRequest } from "../../firmware/middleware.js"
import { notification } from "../../firmware/util.js"

export class ListEditor extends HTMLElement {
	setList(listId) {
		this.listId = listId; // FIXME

		this.setupComponents();
	}

	setupComponents() {
		this.appendChild(document.querySelector('template#listEditor').content.cloneNode(true))

		let list = window.content.list.list; // FIXME

		this.domId = this.querySelector("#listId");
		this.domId.innerText = list.getId();

		this.domTitle = this.querySelector("#listEditorTitle")
		this.domTitle.value = list.getTitle()

		this.domSort = this.querySelector("#listEditorSort")
		this.domSort.value = list.getSort();
		
		this.domSave = this.querySelector("#listEditorSave")
		this.domSave.onclick = () => { this.save(); }
	}

	save() {
		let id = this.listId;
		let title = this.domTitle.value;
		let sort = this.domSort.value;

		ajaxRequest({
			url: 'listUpdate',
			data: {
				id: id,
				title: title,
				sort: sort,
			},
			success: () => {
				notification("good", "List saved");
				window.uimanager.refreshLists();
			}
		});

	}
}

window.customElements.define("list-editor", ListEditor)
