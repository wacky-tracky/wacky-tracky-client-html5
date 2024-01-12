export class Tag {
  constructor(json) { // From DB
    this.id = json.id
    this.title = json.title
    this.textualValue = json.textualValue
    this.numericValue = json.numericValue
    this.backgroundColor = json.backgroundColor
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
    if (this.id === undefined) {
      console.error("tag ID is undefined", this.id)
    }

    return this.id;
  }
}
