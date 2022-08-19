import "./stylesheets/reset.css";
import "./stylesheets/style.css";
import {
  projectCreationMenu,
  renderBigDate,
  renderStaticElements,
  taskCreationMenu,
  signInPopup,
  renderListToNav,
} from "./displayControl.js";
import { taskLibrary, projectLibrary } from "./libraryManagement.js";
import { userSignIn } from "./firebase_files/firebase";

renderStaticElements();

renderBigDate.updateTime();

const content = document.getElementById("content");
const page = document.getElementById("page");
const clock = document.getElementById("date-hero");
const allButtons = document.querySelectorAll("button");

const disableButtons = (bool) => {
  allButtons.forEach((button) => {
    button.disabled = bool;
  });
};

disableButtons(true);

const signInCallback = async (target) => {
  await userSignIn();
  console.log();
  target.remove();
  disableButtons(false);

  renderListToNav(taskLibrary.show(), "task");
  renderListToNav(projectLibrary.show(), "project");
};

// then...
// renderlisttonav(tasklibrary.show(), "task");
// renderlisttonav(projectlibrary.show(), "project");

const popupRef = signInPopup(page, signInCallback, () => disableButtons(false));
console.log(popupRef);

// Observer puts the clock back up when the content is empty && setsState to false.
(() => {
  const config = { childList: true };
  const callback = function (mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        if (content.childNodes.length === 0) {
          renderBigDate.updateTime();
          content.appendChild(clock);
          contentState.setState(false);
        }
      }
    }
  };
  const observer = new MutationObserver(callback);
  observer.observe(content, config);
})();

const newTaskButton = document.getElementById("new-task-button");
newTaskButton.addEventListener("click", () => {
  renderBigDate.stop();
  if (contentState.getState() === false) {
    taskCreationMenu();
    clock.remove();
  }
  contentState.setState(true);
});

const newProjectButton = document.getElementById("new-project-button");
newProjectButton.addEventListener("click", () => {
  renderBigDate.stop();
  if (contentState.getState() === false) {
    projectCreationMenu();
    clock.remove();
  }
  contentState.setState(true);
});

const startButton = document.getElementById("start-button");
startButton.addEventListener("click", () => {
  contentState.setState(true);
});

const contentState = (() => {
  let state = false;
  const getState = () => state;
  const setState = (newState) => {
    if (typeof newState === "boolean") {
      state = newState;
    }
  };

  return {
    getState,
    setState,
  };
})();
