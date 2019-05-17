export default class Tag {
	constructor(json) {
		this.id = json.id;
		this.tagValueId = json.tagValueId;
		this.title = json.title;
		this.textualValue = json.textualValue;
		this.numericValue = json.numericValue;
		this.backgroundColor = json.backgroundColor;
	}

	getTagValueId() {
		return this.tagValueId;
	}

	getTitle() {
		return this.title;
	}

	getTextualValue() {
		return this.textualValue;
	}

	getNumericValue() {
		return this.numericValue;
	}

	getBackgroundColor() {
		return this.backgroundColor;
	}

	getId() {
		return this.id;
	}
}
