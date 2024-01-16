import './TaskContent.js'

import { ajaxRequest } from '../../firmware/middleware.js'

export class ListContent extends window.HTMLElement {
  setList (mdlList) {
    this.list = mdlList
  }

  setupComponents (menuItem) {
    this.sidePanelMenuItem = menuItem
    /*
    this.domDialog = $('<p><small>Note: your changes will be automatically saved when you close this dialog.</small></p>')
    this.domInputTitle = this.domDialog.createAppend('<p>Title:</p>').createAppend('<input />').text(this.list.title)
    this.domInputSort = this.domDialog.createAppend('<p>Sort:</p>').createAppend('<select />')
    this.domInputSort.createAppend('<option value = "title">Title</option>')
    this.domInputSort.createAppend('<option value = "dueDate">Due Date</option>')

    this.domShowTimeline = this.domDialog.createAppend('<p>Timeline:</p>').createAppend('<input type = "checkbox" />')

*/
    this.domList = document.createElement("ul")
    this.domList.id = "taskList"
    this.domList.setAttribute("title", "Tasks")
    this.appendChild(this.domList)

    this.domListMessage = document.createElement("div")
    this.domListMessage.classList.add("centeredMessage")
    this.domListMessage.setAttribute("role", "note")
    this.domListMessage.title = "Currently selectect list description"
    this.domListMessage.hidden = true
    this.appendChild(this.domListMessage)
  }

  getId () {
    return this.list.id
  }

  getCountItems () {
    return this.list.countItems
  }

  getTitle () {
    return this.list.title
  }

  openDialog () {
    this.domInputTitle.val(this.list.title)
    this.domInputSort.val(this.list.sort)
    this.domShowTimeline.val(this.list.timeline)

    this.domDialog.dialog({
      title: "List options",
      close: function() {
        ajaxRequest({
          url: 'listUpdate',
          data: {
            list: this.list.id,
            title: this.domInputTitle.val(),
            sort: this.domInputSort.val(),
            timeline: this.domShowTimeline.val(),
          }
        })
      }
    })
  }

  updateTaskCount () {
    let newCount = this.domList.children.length

    this.sidePanelMenuItem.setSuffixText(newCount)

    if (newCount > 0) {
      this.domListMessage.hidden = true
      this.domListMessage.innerText = ""
    } else {
      this.domListMessage.hidden = false
      this.domListMessage.innerText = "This list is empty."
    }
  }

  select () {
    window.dbal.remote.getTasks(this.list.id)

    window.dbal.local.getTasks((tasks) => {
      this.addAll(tasks)
    }, this.list.id)

    window.content.setList(this)

    window.sidepanel.deselectAll()
    this.sidePanelMenuItem.select()
  }

  addAll (tasks) {
    this.clear()

    for (const item of tasks) {
      let task = document.createElement("task-content")
      task.setFields(item)
      task.setupComponents()

      this.add(task)
    }

    this.updateTaskCount()
  }

  add (task) {
    let li = document.createElement("li")
    li.append(task)
    this.domList.append(li)

    this.updateTaskCount()
  }

  deselect () {
    this.sidePanelMenuItem.deselect()
  }

  clear () {
    while (this.domList.hasChildNodes()) {
      this.domList.firstChild.remove()
    }
  }

  del () {
    ajaxRequest({
      url: 'deleteList',
      data: { id: this.list.id },
      success: window.uimanager.refreshLists
    })
  }
}

window.customElements.define("list-content", ListContent)
