import TagEditor from './TagEditor.js'

export default class SidePanelTagButton extends HTMLElement {
	setFields(jsonTag) {
		this.fields = jsonTag
	}

	setupComponents() {
		let link = document.createElement("a");
		link.setAttribute("href", "#")
		link.classList.add("tagMenuLink")
		link.classList.add("tag")
		link.onclick = () => {
			this.openTagEditDialog(this);
		};

		let tagTitle = document.createElement("span");
		tagTitle.classList.add("tagTitle");
		link.appendChild(tagTitle);

		let tagCaption = document.createElement("span")
		tagCaption.innerText = this.fields.textualValue;
		tagCaption.classList.add("subtle");
		link.appendChild(tagCaption);

		let indicator = document.createElement("div")
		indicator.classList.add("indicator")
		indicator.style.backgroundColor = this.fields.backgroundColor
		indicator.innerHTML = "&nbsp;&nbsp;&nbsp;"
		link.appendChild(indicator)

		this.appendChild(link);
	}

	openTagEditDialog() {
		let tagEditor = document.createElement("tag-editor")
		tagEditor.setFields(this.fields);

		window.content.setTab(tagEditor);
	}

	/**	

	this.domDialog = $('<div />');
	this.domInputTitle = this.domDialog.createAppend('<p>').text('Title: ').createAppend('<input />').text(this.obj.title);
	this.domInputShortTitle = this.domDialog.createAppend('<p>').text('Short Title: ').createAppend('<input />').text(this.obj.shortTitle);
	this.domInputBackgroundColor = this.domDialog.createAppend('<p>').text('Background color: ').createAppend('<input />').val(this.obj.backgroundColor);

	Tag.prototype.requestUpdate = function() {
		ajaxRequest({
			url: "/updateTag",
			data: {
				id: window.tag.obj.id,
				newTitle: window.tag.domInputTitle.val(),
				shortTitle: window.tag.domInputShortTitle.val(),
				backgroundColor: window.tag.domInputBackgroundColor.val()
			}
		});
	};

	Tag.prototype.showDialog = function() {
		window.tag = self;

		self.domInputTitle.val(self.obj.title);
		self.domInputShortTitle.val(self.obj.shortTitle);

		$(self.domDialog).dialog({
			title: 'Tag Options for ' + self.obj.title,
			close: self.requestUpdate
		});	
	};

	*/
}

window.customElements.define("side-panel-tag-button", SidePanelTagButton)
