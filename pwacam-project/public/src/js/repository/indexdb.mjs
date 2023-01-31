import {openDB} from '../../vendor/idb.mjs';
import {loggerFactory} from "../../utils/logger.mjs";

const logger = loggerFactory('IndexedDB')

/**
 * @type {Promise<IDBDatabase>}
 */
const dbPromise = openDB('posts-store', 1, {
    // upgrade is called when the database is created or the version is changed 
    upgrade(db, oldVersion, newVersion) {
      logger(`Creating the object store, oldVersion: ${oldVersion}, newVersion: ${newVersion}`);
      // keypath is used to set the id or property for lookup
      return db.createObjectStore('posts', {keyPath: 'id'})
    }
  }
)

const getAllPosts = async () => {
  const db = await dbPromise;
  const tx = db.transaction('posts', 'readonly');

  // No need to use objectStore if the transaction involves only one store
  return tx.store.getAll();
}

const clearAllPosts = async () => {
  logger('Clearing all posts from IndexedDB');
  const db = await dbPromise;
  const tx = db.transaction('posts', 'readwrite');

  // No need to use objectStore if the transaction involves only one store
  return tx.store.clear();
}

/**
 * @param postsIds{{id: string}[]}}
 * @returns {Promise<void>}
 */
const deletePosts = async (postsIds) => {
  logger(`Found ${postsIds.length} posts to delete`);

  const db = await dbPromise;
  const tx = db.transaction('posts', 'readwrite');

  const deletePromises = postsIds.map((post) => {
    logger(`Deleting post with id ${post.id} from IndexedDB`);
    return tx.store.delete(post.id);
  });

  return Promise.all([deletePromises, tx.done]);
}

export {dbPromise, getAllPosts, clearAllPosts, deletePosts};
