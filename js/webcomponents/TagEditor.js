export default class TagEditor extends HTMLElement {
	setFields(tag) {
		this.tag = tag;
		this.setupComponents();
	}

	setupComponents() {
		this.appendChild(document.querySelector('template#tagEditor').content.cloneNode(true))

		this.domTitle = this.querySelector("#tagEditorTitle");
		this.domTitle.value = this.tag.title;

		this.domBackgroundColor = this.querySelector("#tagEditorBackgroundColor")
		this.domBackgroundColor.value = this.tag.backgroundColor;

		this.domTextualValue = this.querySelector("#tagValueTextual")
		this.domTextualValue.value = this.tag.textualValue;

		this.domNumericValue = this.querySelector("#tagValueNumeric")
		this.domNumericValue.value = this.tag.numericValue;

		this.domButtonSave = this.querySelector("#tagEditorSave")
		this.domButtonSave.onclick = () => {
			this.save();
		}

		this.domButtonDelete = this.querySelector("#tagEditorDelete")
		this.domButtonDelete.onclick = () => {
			this.del();
		}
	}

	save() {
		let id = this.tag.id;
		let title = this.domTitle.value;
		let backgroundColor = this.domBackgroundColor.value;

		ajaxRequest({
			url: 'updateTag',
			data: {
				id: id,
				tagValueId: this.tag.tagValueId,
				newTitle: title,
				shortTitle: title,
				textualValue: this.domTextualValue.value,
				numericValue: this.domNumericValue.value,
				backgroundColor: backgroundColor,
			},
			success: () => {
				notification("good", "Tag saved");
				window.uimanager.fetchTags();
			}
		});
	}	

	del() {
		let id = this.tag.id;

		ajaxRequest({
			url: 'deleteTag',
			data: {
				id: id
			},
			success: () => {
				notification("good", "Tag deleted");
				window.uimanager.fetchTags();
			}
		});

	}
}

window.customElements.define("tag-editor", TagEditor)
