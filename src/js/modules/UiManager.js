// import { Tag } from './model/Tag.js'

import { setupDefaultContextMenuAction } from '../firmware/util.js'

// import { ajaxRequest } from '../firmware/middleware.js'

export class UiManager {
  constructor () {
    window.selectedItem = null

    setupDefaultContextMenuAction()
  }

  loadListFromHash () {
    if (window.location.hash.length === 0) {
      return
    }

    for (const list of window.listElements) {
      const hashListTitle = window.location.hash.replace('#', '')

      if (window.content.list.getTitle() === hashListTitle) {
        // Prevents re-loading the list if it's already selected.
        return
      }

      if (list.getTitle() === window.location.hash.replace('#', '')) {
        list.select()
      }
    }
  }

  renderTaskCreated (json) {
    const task = document.createElement('task-content')
    task.setFields(json)
    task.setupComponents()

    if (window.selectedItem === null) {
      window.content.list.add(task)
    } else {
      window.selectedItem.addSubtask(task)

      if (!window.selectedItem.isSubtasksVisible()) {
        window.selectedItem.toggleSubtasks()
      }
    }
  }

  onBootloaderSuccess (init) {
    document.querySelector('#initMessages').remove()

    if (init.wallpaper !== null) {
      const img = 'url(/wallpapers/' + init.wallpaper + ')'
      document.body.style.backgroundImage = img
    }

    window.loginForm = document.createElement('login-form')
    window.loginForm.create()

    if (init.username !== null) {
      this.loginSuccess()
    } else {
      window.loginForm.show()
    }
  }

  onBootloaderOffline () {
    document.querySelector('#initMessages').remove()

    this.setupMainView()
  }

  loginSuccess () {
    if (window.loginForm != null) {
      window.loginForm.hide()
    }

    this.setupMainView()
  }

  setupMainView () {
    window.sidepanel = document.createElement('side-panel')
    window.sidepanel.setupElements()
    document.body.appendChild(window.sidepanel)

    window.content = document.createElement('content-panel')
    window.content.setupComponents()
    document.body.appendChild(window.content)

    // Fetch tags, then lists, because List->Tasks need Tags to be available.
    this.refreshTags(false)
    this.refreshLists(false)
  }

  refreshTags (fromRemote) {
    if (fromRemote) {
      window.dbal.remote.fetchTags()
    } else {
      window.dbal.local.getTags(this.renderTags)
    }
  }

  refreshLists (fromRemote) {
    if (fromRemote) {
      window.dbal.remote.fetchLists()
    } else {
      window.dbal.local.getLists(this.renderLists)
    }
  }

  renderLists (lists) {
    window.sidepanel.clearLists()
    window.listElements = {}

    for (const mdlList of lists) {
      const list = document.createElement('list-content')
      list.setList(mdlList)

      const menuItem = window.sidepanel.addListMenuItem(mdlList, list)
      list.setupComponents(menuItem)

      window.listElements[mdlList.id] = list // FIXME deprecated
    }
  }

  renderTags (tags) {
    window.tagElements = []

    for (const mdlTag of tags) {
      window.sidepanel.addTag(mdlTag)
    }
  }
}
