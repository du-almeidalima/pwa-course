"use strict";

import { createCard } from "./components/card.mjs";
import { setCreatPostButtonListeners } from "./components/create-post-button.mjs";

const sharedMomentsArea = document.querySelector("#shared-moments");

// Init
const card = createCard();
sharedMomentsArea.appendChild(card);
setCreatPostButtonListeners();
