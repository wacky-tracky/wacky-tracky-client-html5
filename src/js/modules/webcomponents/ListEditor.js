import { ajaxRequest, notification } from "../../firmware/middleware.js"

export default class ListEditor extends HTMLElement {
	setList(listId) {
		this.listId = listId;

		this.setupComponents();
	}

	setupComponents() {
		this.appendChild(document.querySelector('template#listEditor').content.cloneNode(true))

		let list = window.lists[this.listId];

		this.domTitle = this.querySelector("#listEditorTitle")
		this.domTitle.value = list.fields.title

		this.domSort = this.querySelector("#listEditorSort")
		this.domSort.value = list.fields.sort
		
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
				window.uimanager.fetchLists();
			}
		});

	}
}

window.customElements.define("list-editor", ListEditor)
