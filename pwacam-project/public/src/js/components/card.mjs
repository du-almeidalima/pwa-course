"use strict";

import { USER_CACHE_KEY } from "../constants/cache-keys.constants.mjs";

const clickHandler = async () => {
  // Programmatically adding requests to cache. Remember that add and addAll also performs the request
  // Also, CacheAPI works outside of a Service Worker scope.
  // This could be used as a tool that allows the user to save something to read later and potentially offline
  const cache = await caches.open(USER_CACHE_KEY);
  cache.addAll(["https://httpbin.org/get", "/src/images/sf-boat.jpg"]);
};

export const createCard = (title, location, imgUrl) => {
  const cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";

  const cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = `url(${imgUrl})`;
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "180px";
  cardTitle.style.color = "white";
  cardWrapper.appendChild(cardTitle);

  const cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = title;
  cardTitle.appendChild(cardTitleTextElement);

  const cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = location;
  cardSupportingText.style.textAlign = "center";
  cardWrapper.appendChild(cardSupportingText);

  // On Demand Cache
  // if ("caches" in window) {
  //   const cardSaveButton = document.createElement("button");
  //   cardSaveButton.innerText = "Save";
  //   cardSaveButton.className = "mdl-button mdl-js-button mdl-js-ripple-effect";
  //   cardSaveButton.addEventListener("click", clickHandler);
  //   cardWrapper.appendChild(cardSaveButton);
  // }

  componentHandler.upgradeElement(cardWrapper);

  return cardWrapper;
};
