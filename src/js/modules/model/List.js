export class List {
  constructor (json) { // From DB
    this.id = json.ID
    this.countItems = json.CountItems
    this.title = json.Title
    this.sort = json.Sort
    this.timeline = json.Timeline
  }

  getSort () {
    return this.sort
  }

  getId () {
    return this.id
  }

  getTitle () {
    return this.title
  }

  getCountItems () {
    return this.countItems
  }
}
