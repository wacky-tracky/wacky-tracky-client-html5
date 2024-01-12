export class Task {
  constructor (json) { // From DB
    this.id = json.id
    this.content = json.content
  }
}
