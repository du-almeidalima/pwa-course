import {openDB} from '../../vendor/idb.mjs';
import {loggerFactory} from "../../utils/logger.mjs";

const logger = loggerFactory('IndexedDB')
const dbPromise = openDB('posts-store', 1, {
    // upgrade is called when the database is created or the version is changed 
    upgrade(db, oldVersion, newVersion) {
      logger(`Creating the object store, oldVersion: ${oldVersion}, newVersion: ${newVersion}`);
      // keypath is used to set the id or property for lookup
      return db.createObjectStore('posts', {keyPath: 'id'})
    }
  }
)

export {dbPromise};
