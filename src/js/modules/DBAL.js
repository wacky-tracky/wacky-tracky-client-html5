import List from "./model/List.js";

export default class DBAL {
	constructor() {
		this.version = 1;

		var req = window.indexedDB.open("db", this.version);
		
		req.onsuccess = () => {
			this.db = req.result;
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

		var [, lists] = this.dbTx("lists");

		lists.add(mdlList);
	}

	getLists(onGetCallback) {
		var [, lists] = this.dbTx("lists")

		var req = lists.getAll()
		req.onsuccess = () => { 
			// FIXME performance issues
			// * recreating 2 new lists for sorting purposes
			// * rehydrating all values?

			var ret = {};

			req.result.forEach((jsonList) => {
				ret[jsonList.title] = (new List(jsonList));
			});

			var orderedRet = [];
			Object.keys(ret).sort().forEach(k => {
				orderedRet[k] = ret[k];
			});

			ret = orderedRet;

			onGetCallback(Object.values(ret)) 
		}	
	}
}
