import { deferredPrompt } from "./app.mjs";

let hasBeenPrompted = false;

var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);

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
  createPostArea.style.display = "none";
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);
