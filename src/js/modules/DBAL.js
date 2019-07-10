import List from "./model/List.js";
import Tag from "./model/Tag.js";
import { generalError } from "../firmware/util.js";

export default class DBAL {
	constructor() {
		this.version = 1;	
	}

	open(onReadyCallback) {
		var req = window.indexedDB.open("db", this.version);
		
		req.onsuccess = () => {
			this.db = req.result;
			console.log("suc");
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

		db.createObjectStore("lists", {keyPath: "id"});
		db.createObjectStore("tasks", {keyPath: "id"});
		db.createObjectStore("tags", {keyPath: "id"});
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
		req = lists.get(listId);

		req.onsuccess = () => {
			callback(req.result);
		}
	}

	getLists(onGetCallback) {
		var [, lists] = this.dbTx("lists")

		var req = lists.getAll()
		req.onsuccess = () => { 
			// FIXME performance issues
			// * recreating 2 new lists for sorting purposes
			// * rehydrating all values?

			var ret = [];
			ret = req.result.map(x => new List(x))
			ret = ret.sort((a, b) => { return a.title.localeCompare(b.title)});

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

		var [, req] = this.dbTx("tags");

		req.put(mdlTag);
		req.onabort = generalError
		req.onerror = generalError
		req.oncomplete = (e) => {
			console.log("complete", e);
		}
	}

}
