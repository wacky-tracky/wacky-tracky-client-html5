export default class ListControls extends HTMLDivElement {
	setupComponents() {
		this.appendChild(document.querySelector('#listControls').content.cloneNode(true))

		this.domLabel = this.querySelector("h3");
		this.domButtonDelete = this.querySelector("#delete");
		this.domButtonSettings = this.querySelector("#settings");
	}

	setList(list) {
		this.domLabel.innerText = list.fields.title;

		this.domButtonDelete.onclick = () => { list.del() };
	}

/**
	{

		this.domLabel = this.dom.createAppend('<span />').text(this.list.fields.title);
		this.domButtonDelete = this.dom.createAppend('<button />').text("Delete");
		this.domButtonDelete.click(function (e) { self.del(); });

		this.domButtonSettings = this.dom.createAppend('<button />').text('Settings');
		this.domButtonSettings.click(function (e) { self.showSettings(); });

		this.domButtonMore = this.dom.createAppend('<button />').text('^');
		
		ListControls.prototype.requestDownloadJson = function() {
			window.location = window.host + 'listDownload?id=' + self.list.fields.id + '&format=json'
		};

		ListControls.prototype.requestDownloadText = function() {
			window.location = window.host + 'listDownload?id=' + self.list.fields.id + '&format=text'
		};


		ListControls.prototype.del = function() {
			this.list.del();
		};

		ListControls.prototype.toDom = function() {
			return this.dom;
		};

		ListControls.prototype.showSettings = function() {
			this.list.openDialog();
		};

		this.menuMore = new Menu();
		this.menuMore.domItems.addClass('listControlsMenu');
		this.menuMore.dropDown = true;
		this.menuMore.addItem('Download (JSON)', this.requestDownloadJson);
		this.menuMore.addItem('Download (Text)', this.requestDownloadText);
		this.menuMore.addTo(this.domButtonMore);
	}
	*/
}

document.registerElement("list-controls", ListControls)
