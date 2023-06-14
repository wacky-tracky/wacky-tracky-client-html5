export class List {
	constructor(json) {
		this.id = json.ID;
		this.countItems = json.countItems;
		this.title = json.Title;
		this.sort = json.sort;
		this.timeline = json.timeline;
	}

	getSort() {
		return this.sort;
	}

	getId() {
		return this.id;
	}

	getTitle() {
		return this.title;
	}

	getCountItems() {
		return this.countItems;
	}
}
