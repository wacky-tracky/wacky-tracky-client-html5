export default class Content extends HTMLDivElement {
	constructor() {
		this.dom = $('<div id = "content" />');
		this.taskInput = new TaskInputBox();
		this.dom.append(this.taskInput.toDom());
		this.domListContainer = this.dom.createAppend('<div id = "listContainer">');
	}

	setList(list) {
		window.selectedItem = null;

		this.list = list;
		this.domListContainer.children().remove();
		$('.tagsMenu').remove();
		$('.listControlsMenu').remove();
		this.domListContainer.append(list.toDomContent());
		this.domListContainer.append(new ListControls(list).toDom());

		this.taskInput.enable();
	}
}


