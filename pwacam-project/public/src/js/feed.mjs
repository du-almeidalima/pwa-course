"use strict";

import { createCard } from "./components/card.mjs";
import { setCreatePostButtonListeners } from "./components/create-post-button.mjs";
import { loggerFactory } from "../utils/logger.mjs";
import { BASE_API } from "./constants/cache-keys.mjs";

const logger = loggerFactory("Feed");
const sharedMomentsArea = document.querySelector("#shared-moments");

const getCard = async () => {
  const URL = `${BASE_API}/post`;
  const card = createCard();

  let networkRequest;

  // Dispatch Cache and Networking requests simultaneously.
  // First, use Cache response and then the network response
  if ("caches" in window) {
    caches.match(URL).then((cacheRes) => {
      if (!networkRequest) {
        logger("Cache response", cacheRes);
      }
    });
  }

  fetch(URL).then(async (fetchRes) => {
    const json = await fetchRes.json();
    networkRequest = json;

    logger("Fetch response", json);
  });

  return card;
};

// Init
getCard().then((card) => {
  sharedMomentsArea.appendChild(card);
});

setCreatePostButtonListeners();
