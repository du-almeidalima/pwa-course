"use strict";

import {createCard} from "./components/card.mjs";
import {setCreatePostButtonListeners} from "./components/create-post-button.mjs";
import {loggerFactory} from "../utils/logger.mjs";
import {postsApi} from "./repository/posts.api.js";
import {dbPromise} from "./repository/indexdb.mjs";

const logger = loggerFactory("Feed");
const sharedMomentsArea = document.querySelector("#shared-moments");

const buildCards = (posts) => {
  if (!posts || posts.length === 0) {
    return;
  }
  // Removing previous cards
  sharedMomentsArea.innerHTML = "";

  // For some reason, Firebase Realtime Database is returning null for the first item...
  const nonNullPosts = posts.filter(p => !!p);

  for (const {title, location, image} of nonNullPosts) {
    const card = createCard(title, location, image);
    sharedMomentsArea.appendChild(card);
  }
}

const getCards = async () => {

  let networkRequest;

  // Dispatch Cache and Networking requests simultaneously.
  // First, use Cache response and then the network response
  if ("indexedDB" in window) {
    const openedDb = await dbPromise;
    const tx = openedDb.transaction('posts', 'readonly');
    const store = tx.store;
    const cachedPosts = await store.getAll();

    // With Cache
    // caches.match(ENDPOINTS.GET_POSTS_URL).then(async (cachedPosts) => {
    //   if (!networkRequest && cachedPosts) {
    //     const cachedPostsJson = await cachedPosts.json();
    //     logger("Cache response", cachedPostsJson);
    //
    //     buildCards(cachedPosts)
    //   }
    // });
    
    buildCards(cachedPosts);
  }

  postsApi.getPosts().then(posts => {
    logger("Fetch Posts:", posts);
    networkRequest = posts;

    buildCards(posts)
  })
};

// Init
getCards();

setCreatePostButtonListeners();
