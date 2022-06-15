"use strict"

import { deferredPrompt } from "../app.mjs";

// UI Elements
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const shareImageButton = document.querySelector('#share-image-button');

// State
let hasBeenPrompted = false;

// Handlers
function openCreatePostModal() {
  createPostArea.style.display = "block";

  if (deferredPrompt && !hasBeenPrompted) {
    deferredPrompt.prompt().then((choiceResult) => {
      console.log(choiceResult);
      if (choiceResult.outcome === "dismissed") {
        console.log("User canceled the installation");
      } else {
        console.log('User added to home screen');
      }

      hasBeenPrompted = true;
    });
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

export const setCreatePostButtonListeners = () => {
  shareImageButton.addEventListener('click', openCreatePostModal);
  closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
}