"use strict";

import { createCard } from "./components/card.mjs";
import { setCreatPostButtonListeners } from "./components/create-post-button.mjs";
import { loggerFactory } from "../utils/logger.mjs";

const logger = loggerFactory("Feed");
const sharedMomentsArea = document.querySelector("#shared-moments");

const getCard = async () => {
  const URL = "https://httpbin.org/get";
  const card = createCard();

  let networkRequest;

  // Dispatch Cache and Networking requests simultaneously
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

setCreatPostButtonListeners();
