export class Task {
	constructor(json) { // From DB
    this.id = json.ID
    this.content = json.Content
	}
}
