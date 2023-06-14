import { List } from "./model/List.js";
import { Tag } from "./model/Tag.js";
import { generalError } from "../firmware/util.js";

export class DBAL {
  constructor() {
    this.version = 2;
  }

  open(onReadyCallback) {
    var req = window.indexedDB.open("db", this.version);

    req.onsuccess = () => {
      this.db = req.result;
      console.log("DB Opened Sucessfully");
      onReadyCallback();
    }

    req.onerror = (e) => {
      throw Error(e);
    }

    req.onupgradeneeded = (e) => {
      this.upgrade(e);
    }
  }

  upgrade(e) {
    var db = e.target.result;

    this.createStoreIfNotExists(db, "lists", "id");
    this.createStoreIfNotExists(db, "tasks", "id");
    this.createStoreIfNotExists(db, "tags", "id");
  }

  deleteEverything() {
    var req = window.indexedDB.deleteDatabase("db")

    req.onerror = () => {
      console.log("errored");
    }

    req.onsuccess = () => {
      console.log("db deleted");
      window.location.reload();
    }
  }

  createStoreIfNotExists(db, storeName, path) {
    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName, {keyPath: path});
    }
  }

  dbTx(storeName) {
    if (this.db == null) {
      throw new Error("Cannot run transaction, no database connection");
    }

    var tx = this.db.transaction(storeName, "readwrite")
    var st = tx.objectStore(storeName);

    return [tx, st]
  }

  addListFromServer(jsonList) {
    let mdlList = new List(jsonList)

    var [, req] = this.dbTx("lists");

    req.put(mdlList);
    req.onabort = generalError
    req.onerror = generalError
    req.oncomplete = (e) => {
      console.log("complete", e);
    }
  }

  getList(listId, callback) {
    let req = this.dbTx("lists").get(listId);

    req.onsuccess = () => {
      callback(req.result);
    }
  }

  getLists(onGetCallback) {
    var [, lists] = this.dbTx("lists")

    var req = lists.getAll()
    req.onsuccess = () => {
      var ret = [];
      req.result.map(x => ret.push(x))

      //ret = ret.sort((a, b) => { return a.title.localeCompare(b.title)});

      console.log("getLists", ret)
      onGetCallback(ret)
    }
  }

  getTags(onGetCallback) {
    var [, tags] = this.dbTx("tags")

    var req = tags.getAll();
    req.onsuccess = () => {
      var ret = [];

      req.result.forEach((jsonTag) => {
        ret.push(new Tag(jsonTag));
      });

      /**
      var orderedRet = [];
      Object.keys(ret).sort().forEach(k => {
        orderedRet[k] = ret[k];
      });

      ret = orderedRet
      */

      onGetCallback(ret)
    }
  }

  addTagFromServer(jsonTag) {
    let mdlTag = new Tag(jsonTag)
    console.log("add tag", jsonTag)

    var [, req] = this.dbTx("tags");

    req.onabort = generalError
    req.onerror = generalError
    req.oncomplete = (e) => {
      console.log("complete", e);
    }
    req.put(mdlTag);
  }

}
