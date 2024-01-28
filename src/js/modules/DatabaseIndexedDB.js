import { List } from './model/List.js'
import { Tag } from './model/Tag.js'
import { Task } from './model/Task.js'

import { generalError } from '../firmware/util.js'

export class DatabaseIndexedDB {
  constructor () {
    this.version = 2
  }

  open (onReadyCallback) {
    const req = window.indexedDB.open('db', this.version)

    window.dbreq = req

    req.onsuccess = () => {
      this.db = req.result
      onReadyCallback()
    }

    req.onerror = (e) => {
      throw Error(e)
    }

    req.onupgradeneeded = (e) => {
      this.upgrade(e)
    }
  }

  upgrade (e) {
    const db = e.target.result

    this.createStoreIfNotExists(db, 'lists', 'id')
    this.createStoreIfNotExists(db, 'tags', 'id')

    const tblTasks = this.createStoreIfNotExists(db, 'tasks', 'id')

    if (tblTasks != null) {
      tblTasks.createIndex('listId', ['parentId', 'parentType'], { unique: false })
    //  tblTasks.index('important').openCursor(IDBKeyRange.only('true'))
    }
  }

  deleteEverything () {
    const req = window.indexedDB.deleteDatabase('db')

    req.onerror = (err) => {
      throw new Error(err)
    }

    req.onsuccess = () => {
      window.location.reload()
    }
  }

  createStoreIfNotExists (db, storeName, path) {
    if (!db.objectStoreNames.contains(storeName)) {
      return db.createObjectStore(storeName, { keyPath: path })
    }
  }

  dbTx (storeName) {
    if (this.db == null) {
      throw new Error('Cannot run transaction, no database connection')
    }

    const tx = this.db.transaction(storeName, 'readwrite')
    const st = tx.objectStore(storeName)

    return [tx, st]
  }

  addTasksFromServer (res) {
    res.tasks.map(x => this.addTaskFromServer(x))
  }

  addTaskFromServer (jsonTask) {
    const [, req] = this.dbTx('tasks')

    req.onabort = generalError
    req.onerror = generalError
    req.put(jsonTask)
  }

  addListFromServer (jsonList) {
    const [, req] = this.dbTx('lists')

    req.onabort = generalError
    req.onerror = generalError

    req.put(jsonList)
  }

  addTagFromServer (jsonTag) {
    const [, req] = this.dbTx('tags')

    req.onabort = generalError
    req.onerror = generalError

    req.put(jsonTag)
  }

  getList (listId, callback) {
    const req = this.dbTx('lists').get(listId)

    req.onsuccess = () => {
      callback(req.result)
    }
  }

  getLists (onGetCallback) {
    const [, lists] = this.dbTx('lists')

    const req = lists.getAll()
    req.onsuccess = () => {
      let ret = []
      req.result.map(x => ret.push(new List(x)))
      ret = ret.sort((a, b) => { return a.getTitle().localeCompare(b.getTitle()) })

      onGetCallback(ret)
    }
  }

  getTasks (onGetCallback, listId) {
    const [, tasks] = this.dbTx('tasks')

    const req = tasks.index('listId').getAll([listId, 'list'])

    req.onerror = generalError
    req.onabort = generalError
    req.onsuccess = () => {
      const ret = []

      req.result.map(json => ret.push(new Task(json)))

      onGetCallback(ret)
    }
  }

  getTags (onGetCallback) {
    const [, tags] = this.dbTx('tags')

    const req = tags.getAll()

    req.onsuccess = () => {
      const ret = []

      req.result.forEach((jsonTag) => {
        ret.push(new Tag(jsonTag))
      })

      /**
      var orderedRet = []
      Object.keys(ret).sort().forEach(k => {
        orderedRet[k] = ret[k]
      })

      ret = orderedRet
      */

      onGetCallback(ret)
    }
  }
}
