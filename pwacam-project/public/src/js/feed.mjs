"use strict";

import {createCard} from "./components/card.mjs";
import {setCreatePostButtonListeners} from "./components/create-post-button.mjs";
import {loggerFactory} from "../utils/logger.mjs";
import {ENDPOINTS, postsApi} from "./repository/posts.api.js";

const logger = loggerFactory("Feed");
const sharedMomentsArea = document.querySelector("#shared-moments");

const buildCards = (posts) => {
  if (!posts) {
    return;
  }
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
  if ("caches" in window) {
    caches.match(ENDPOINTS.GET_POSTS_URL).then(async (cachedPosts) => {
      if (!networkRequest && cachedPosts) {
        const cachedPostsJson = await cachedPosts.json();
        logger("Cache response", cachedPostsJson);

        buildCards(cachedPostsJson)
      }
    });
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
