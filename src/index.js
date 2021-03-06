import "./reset.css";
import "./style.css";
import {
  projectCreationMenu,
  renderBigDate,
  renderStaticElements,
  taskCreationMenu,
} from "./pageControl.js";

renderStaticElements();
renderBigDate.updateTime();

const content = document.getElementById("content");
const clock = document.getElementById("date-hero");

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
