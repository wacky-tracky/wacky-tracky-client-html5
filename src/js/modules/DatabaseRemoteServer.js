import { ajaxRequest } from "../firmware/middleware.js"

export class DatabaseRemoteServer {
  getTasks () {
    ajaxRequest({
      url: 'Task/List',
      success: (jsonTasks) => {
        jsonTasks.Tasks.map((x) => window.dbal.local.addTaskFromServer(x))
      },
      params: {
        'listId': 123,
      },
    })
  }

  fetchTags () {
    window.sidepanel.clearTags() // FIXME

    ajaxRequest({
      url: 'ListTags',
      success: (jsonTags) => {
        for (const json of jsonTags.Tags) {
          window.dbal.local.addTagFromServer(json)
        }
      }
    })
  }

  fetchLists () {
    ajaxRequest({
      url: 'ListLists',
      success: (res) => {
        for (const jsonList of res.Lists) {
          window.dbal.local.addListFromServer(jsonList)
        }
      }
    })
  }
}
