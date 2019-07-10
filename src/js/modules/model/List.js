export default class List {
	constructor(json) {
		this.id = json.id;
		this.countItems = json.countItems;
		this.title = json.title;
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
