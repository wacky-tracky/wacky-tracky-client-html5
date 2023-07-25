import { DatabaseIndexedDB } from './DatabaseIndexedDB.js';
import { DatabaseRemoteServer } from './DatabaseRemoteServer.js';

export class DBAL {
  constructor() {
    this.local = new DatabaseIndexedDB();
    this.remote = new DatabaseRemoteServer();
  }

  open(readyCallback) {
    this.local.open(readyCallback);
  }
}
