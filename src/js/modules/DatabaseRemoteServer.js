import { ajaxRequest } from '../firmware/middleware.js'

export class DatabaseRemoteServer {
  getTasks (theListId) {
    ajaxRequest({
      url: 'Task/List',
      success: (jsonTasks) => {
        window.dbal.local.addTasksFromServer(jsonTasks)
      },
      data: {
        listId: theListId
      }
    })
  }

  fetchTags () {
    window.sidepanel.clearTags() // FIXME

    ajaxRequest({
      url: 'ListTags',
      success: (jsonTags) => {
        for (const json of jsonTags.tags) {
          window.dbal.local.addTagFromServer(json)
        }
      }
    })
  }

  fetchLists () {
    ajaxRequest({
      url: 'ListLists',
      success: (res) => {
        for (const jsonList of res.lists) {
          window.dbal.local.addListFromServer(jsonList)
        }
      }
    })
  }
}
