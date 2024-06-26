import {
  addNewProject,
  addNewTask,
  stateManager,
  TaskLibrary,
  ProjectLibrary,
  sortAlg,
  editTask,
  editProject,
  updateLocalStorage, deleteTask, deleteProject, saveEditTask, saveEditProject
} from "./libraryManagement.js";
import SimpleBar from "simplebar";
import "simplebar/dist/simplebar.css";
import Task from "./classes/Task.js";
import Project from "./classes/Project.js";

import dayjs from "dayjs";
import advancedFormat from 'dayjs/plugin/advancedFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

const content = document.getElementById("content");

/**
 *
 * @param {AppConfig} appConfig
 */
const renderStaticElements = (appConfig) => {
  // ref for static elements to append to
  const page = document.getElementById("page");

  // renders the sidebar
  (() => {
    const nav = document.createElement("nav");
    nav.id = "sidebar";

    const header = document.createElement("h1");
    header.id = "page-title";
    header.innerHTML = "Do.";

    const taskContainer = document.createElement("div");
    taskContainer.id = "task-container";
    taskContainer.classList.add("nav-container");
    const taskHeader = document.createElement("h4");
    taskHeader.id = "task-header";
    taskHeader.innerHTML = "Tasks";
    taskContainer.appendChild(taskHeader);
    const taskList = document.createElement("ul");
    taskList.id = "task-list";
    taskContainer.appendChild(taskList);

    const projectContainer = document.createElement("div");
    projectContainer.id = "project-container";
    projectContainer.classList.add("nav-container");
    const projectHeader = document.createElement("h4");
    projectHeader.id = "project-header";
    projectHeader.innerHTML = "Projects";
    projectContainer.appendChild(projectHeader);
    const projectList = document.createElement("ul");
    projectList.id = "project-list";
    projectContainer.appendChild(projectList);

    const headerOverlay = document.createElement("template");
    headerOverlay.innerHTML = `
    <div class="fixed top-0 left-0 w-screen flex justify-end items-center p-2.5 pointer-events-none">
      <button id="sign-out-button" class="pointer-events-auto box-border w-28 h-8 shadow-none flex justify-center items-center border-solid border-2 border-[hsla(302,16%,45%,1)] font-medium text-lg hover:bg-[hsla(302,16%,45%,1)] hover:text-[hsl(36,33%,97%)] transition-all ease-in-out">
        <span>
          sign out
        </span>
      </button>
    </div> 
    `;

    const newNavButton = (name) => {
      const button = document.createElement("button");
      button.id = `new-${name.toLowerCase()}-button`;
      button.classList.add("nav-button");
      button.classList.add("styled-button");
      button.innerHTML = `new ${name}`;
      nav.appendChild(button);
    };

    nav.appendChild(header);
    nav.appendChild(taskContainer);
    newNavButton("task");
    nav.appendChild(projectContainer);
    newNavButton("project");
    page.prepend(nav);
    page.append(headerOverlay.content.cloneNode(true));

    document.getElementById("sign-out-button").addEventListener("click", async () => {
      await appConfig.session.end();
      location.reload();
    });
  })();
};

const dynamicFormParts = (() => {
  // create the popup for adding new tasks
  const newFormWindow = (type, headerText) => {
    const container = document.createElement("div");
    container.id = "form-container";

    const formHeader = document.createElement("h3");
    formHeader.innerHTML = `${headerText}`;

    const form = document.createElement("form");
    form.name = `${type} creation form`;
    form.id = `${type.toLowerCase()}-form`;

    form.appendChild(formHeader);
    container.appendChild(form);
    content.appendChild(container);
  };

  /**
   * @param {HTMLElement} parent
   * @param name
   * @param labelText
   * @param placeholder
   * @param required
   * @param {Array<string>} classList
   */
  const newTextInput = (parent = undefined, name, labelText, placeholder, required, classList) => {
    const label = document.createElement("label");
    label.for = name;
    label.innerHTML = labelText;
    const input = document.createElement("input");
    input.id = name;
    input.classList.add("text-input", ...classList);
    input.type = "text";
    input.placeholder = placeholder;

    if (required) {
      input.required = true;
    }

    if (parent !== undefined) {
      parent.appendChild(label);
      parent.appendChild(input);
    }
    return input;
  };

  /** creates a date input when called
   * @param {HTMLElement} parent
   * @param {string[]} classList
   * @param {Date} value
   * @return {HTMLDivElement}
   */
  const newDateInput = (parent = undefined, classList, value = undefined) => {
    const initial = value ? value : dayjs().format("YYYY-MM-DD");
    const template = document.createElement("template");
    template.innerHTML = `
    <div class="flex flex-row justify-start items-center py-4">
      <label class="flex flex-row justify-start items-center gap-6" for="deadline">
        <span class="leading-tight w-20">
          Deadline.
        </span>
        <input class="m-0 pl-2.5 pr-1.5 ${classList.join(" ")}" name="deadline" id="deadline" type="date" 
          min="${dayjs().format("YYYY-MM-DD")}" 
          value="${initial}">
      </label>
    </div>
    `;
    if (parent !== undefined) {
      parent.appendChild(template.content.cloneNode(true));
    }
    return template.content.cloneNode(true);
  };

  // dropdown menu for selecting the priority
  const newPriorityDropdown = (parent, maxScale, classList) => {
    const template = document.createElement("template");
    template.innerHTML = `
    <div class="flex flex-row justify-start items-center py-4">
      <label class="flex flex-row justify-start items-center gap-6" for="priority">
        <span class="leading-tight w-20">
          Priority.
        </span>
        <select class="m-0 pl-2.5 pr-1.5 ${classList.join(" ")}" name="priority" id="priority">
        </select>
      </label>
    </div>
    `;
    parent.appendChild(template.content.cloneNode(true));
    const input = parent.querySelector("select");
    for (let i = 1; i <= maxScale; i++) {
      const newOption = document.createElement("option");
      newOption.value = i.toString();
      newOption.innerHTML = i.toString();
      input.appendChild(newOption);
    }
  };

  // input for a task checklist
  const newChecklist = (parent, obj) => {
    const label = document.createElement("label");
    label.for = "checklist";
    label.innerHTML = "Checklist.";
    const listDiv = document.createElement("div");
    listDiv.id = "checklist-div";
    const listUl = document.createElement("ul");
    listUl.id = "checklist-list";
    const simpleBar = new SimpleBar(listUl, { autoHide: false });

    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.placeholder = "Add an item...";
    textInput.id = "checklist-text-input";
    textInput.classList.add("text-input");
    const buttonDiv = document.createElement("div");
    buttonDiv.classList.add("form-buttons");
    const addItem = document.createElement("button");
    addItem.type = "button";
    addItem.innerHTML = "add";
    addItem.classList.add("styled-button");
    addItem.classList.add("form-button");
    const removeItem = document.createElement("button");
    removeItem.type = "button";
    removeItem.innerHTML = "remove";
    removeItem.classList.add("styled-button");
    removeItem.classList.add("form-button");
    addItem.addEventListener("click", function(e) {
      e.preventDefault();
      if (textInput.value.length > 0) {
        const listItem = document.createElement("li");
        listItem.classList.add("checklist-item");
        listItem.innerHTML = "- " + textInput.value;
        simpleBar.getContentElement().appendChild(listItem);
        textInput.value = "";
        listItem.scrollIntoView();
      }
    });
    removeItem.addEventListener("click", function(e) {
      e.preventDefault();
      if (simpleBar.getContentElement().childElementCount > 0) {
        simpleBar
          .getContentElement()
          .removeChild(simpleBar.getContentElement().lastElementChild);
      }
    });

    if (obj) {
      for (const checklistItem in obj.checklist) {
        const listItem = document.createElement("li");
        listItem.classList.add("checklist-item");
        listItem.innerHTML = "- " + `${checklistItem}`;
        simpleBar.getContentElement().appendChild(listItem);
        listItem.scrollIntoView();
      }
    }

    buttonDiv.appendChild(addItem);
    buttonDiv.appendChild(removeItem);

    listDiv.appendChild(listUl);
    listDiv.appendChild(textInput);
    listDiv.appendChild(buttonDiv);

    parent.appendChild(label);
    parent.appendChild(listDiv);
  };

  /** compiles tasks for the project creation menu
   * @param parent
   * @param obj
   * @param {string[]} classList
   */
  const newTaskList = (parent = undefined, obj, classList) => {
    const label = document.createElement("label");
    label.setAttribute("for", "checkboxes");
    label.innerHTML = "Tasks.";
    const listDiv = document.createElement("div");
    listDiv.id = "tasklist-div";
    const checkboxes = document.createElement("ul");
    checkboxes.id = "checkboxes";

    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    const checkboxLabel = document.createElement("label");

    const items = [...TaskLibrary.show()];

    sortAlg.timeAsc(items).forEach((item) => {
      const listItem = document.createElement("li");
      listItem.classList.add("task-list-item");

      const cloneCheckbox = checkBox.cloneNode();
      cloneCheckbox.id = `${item.id}`;
      cloneCheckbox.value = `${item.id}`;

      const cloneCheckboxLabel = checkboxLabel.cloneNode();

      cloneCheckboxLabel.setAttribute("for", `${item.id}`);
      let title = item.title;
      if (item.title.length > 30) {
        title = `${item.title.split(" ").slice(0, 7).join(" ")}...`;
      }
      cloneCheckboxLabel.innerHTML = title;

      if (obj) {
        if (obj.tasks.includes(item.id)) {
          cloneCheckbox.checked = true;
        }
      }

      listItem.appendChild(cloneCheckbox);
      listItem.appendChild(cloneCheckboxLabel);
      checkboxes.appendChild(listItem);
    });

    listDiv.appendChild(label);
    listDiv.appendChild(checkboxes);

    parent.appendChild(listDiv);
  };

  /**
   * @param {AppConfig} appConfig
   * @param parent
   */
  const submitButton = (appConfig, parent) => {
    const submitButton = document.createElement("button");
    submitButton.type = "button";
    submitButton.innerHTML = "create";
    submitButton.classList.add("styled-button");
    submitButton.classList.add("form-button");
    submitButton.addEventListener("click", () => {
      if (parent.id === "task-buttons") {
        addNewTask(appConfig, () => {
          renderListToNav(TaskLibrary.show(), "task");
          clearContent();
          stateManager.setAdded(false);
        });
      } else if (parent.id === "project-buttons") {
        addNewProject(appConfig, () => {
          renderListToNav(ProjectLibrary.show(), "project");
          clearContent();
          stateManager.setAdded(false);
        });
      }
    });
    parent.appendChild(submitButton);
  };
  // save button for the edit menus
  const saveButton = (appConfig, parent, obj) => {
    const button = document.createElement("button");
    const explorer = document.getElementById("explorer-frame");
    button.type = "button";
    button.innerHTML = "save";
    button.classList.add("styled-button");
    button.classList.add("form-button");
    button.addEventListener("click", () => {
      const form = document.getElementById("form-container");
      if (confirm("Are you sure?") === true) {
        if (obj.constructor === Task) {
          editTask(appConfig, obj, () => {
            form.remove();
            explorer.style.display = "flex";
            dynamicExplorerParts.refreshItemList(appConfig, "task");
          });
        } else if (obj.constructor === Project) {
          editProject(appConfig, obj, () => {
            form.remove();
            explorer.style.display = "flex";
            dynamicExplorerParts.refreshItemList(appConfig, "project");
          });
        }
      }
    });
    parent.appendChild(button);
  };

  // form cancel button
  const cancelButton = (parent, callback) => {
    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.innerHTML = "cancel";
    cancelButton.classList.add("styled-button");
    cancelButton.classList.add("form-button");
    cancelButton.addEventListener("click", callback);
    parent.appendChild(cancelButton);
  };

  return {
    newFormWindow,
    newTextInput,
    newDateInput,
    newPriorityDropdown,
    newChecklist,
    newTasklist: newTaskList,
    submitButton,
    saveButton,
    cancelButton
  };
})();

const dynamicExplorerParts = (() => {
  const explorerFrame = () => {
    const explorerFrame = document.createElement("div");
    explorerFrame.id = "explorer-frame";

    const explorer = document.createElement("div");
    explorer.id = "explorer";

    explorerFrame.appendChild(explorer);
    content.appendChild(explorerFrame);
  };

  const explorerTabs = (appConfig, parent) => {
    const div = document.createElement("div");

    div.id = "explorer-tabs";

    const buttonDiv = document.createElement("div");

    buttonDiv.id = "header-button-div";

    const taskTab = document.createElement("button");
    taskTab.id = "task-tab-button";
    taskTab.classList.add("tab-button");
    taskTab.classList.add("active-tab");
    taskTab.innerHTML = "Tasks";

    const projectTab = document.createElement("button");
    projectTab.id = "project-tab-button";
    projectTab.classList.add("tab-button");
    projectTab.classList.add("inactive-tab");
    projectTab.innerHTML = "Projects";

    taskTab.addEventListener("click", () => {
      if (taskTab.classList.contains("inactive-tab")) {
        refreshItemList(appConfig, "task");
        taskTab.classList.replace("inactive-tab", "active-tab");
        projectTab.classList.replace("active-tab", "inactive-tab");
      }
    });
    projectTab.addEventListener("click", () => {
      if (projectTab.classList.contains("inactive-tab")) {
        refreshItemList(appConfig, "project");
        projectTab.classList.replace("inactive-tab", "active-tab");
        taskTab.classList.replace("active-tab", "inactive-tab");
      }
    });

    const tabPlaceholder = document.createElement("div");
    tabPlaceholder.id = "tab-placeholder";

    div.appendChild(taskTab);
    div.appendChild(projectTab);
    div.appendChild(tabPlaceholder);
    parent.appendChild(div);
  };

  const itemList = (appConfig, parent, library) => {
    const list = document.createElement("ul");
    list.id = "explorer-list";

    sortAlg.timeAsc(library).forEach((/**Project | Task*/item) => {
      const listItem = document.createElement("li");
      listItem.classList.add("explorer-list-item");
      if (item.constructor.name === "Task") {
        listItem.id = item.id;
      }

      const collapsible = document.createElement("button");
      collapsible.type = "button";
      collapsible.classList.add("collapsible");

      let title = item.title;
      if (item.title.length > 20) {
        title = `${item.title.split(" ").slice(0, 4).join(" ")}...`;
      }

      collapsible.innerHTML = title;

      collapsible.addEventListener("click", function() {
        item.toggleHidden()
        this.classList.toggle("active");
        const hiddenDiv = this.nextElementSibling;
        if (hiddenDiv.style.display === "grid") {
          hiddenDiv.style.display = "none";
        } else {
          hiddenDiv.style.display = "grid";
        }
      });

      const hiddenDiv = document.createElement("div");
      hiddenDiv.classList.add("collapsible-content");
      hiddenDiv.style.display = item._hidden ? "none" : "grid";

      const hiddenContentList = document.createElement("ul");
      hiddenContentList.classList.add("hidden-content-list");

      const editButton = document.createElement("button");
      editButton.classList.add("edit-button");
      editButton.classList.add("hidden-button");
      editButton.classList.add("styled-button");
      editButton.innerHTML = "edit";

      const completeButton = document.createElement("button");
      completeButton.classList.add("complete-button");
      completeButton.classList.add("hidden-button");
      completeButton.classList.add("styled-button");
      completeButton.innerHTML = "complete";

      const removeButton = document.createElement("button");
      removeButton.classList.add("remove-button");
      removeButton.classList.add("hidden-button");
      removeButton.classList.add("styled-button");
      removeButton.innerHTML = "remove item";
      if (item.complete === true) {
        completeButton.classList.add("complete-button-active");
      }

      for (const prop in item) {
        let propListItem = document.createElement("li");
        propListItem.classList.add("hidden-details");

        // looks at the properties being passed in and renders elements accordingly
        switch (true) {
          case prop === "title":
            propListItem.innerHTML = `<u>Title:</u> <br> <br> ${item[prop]} <br>`;
            hiddenContentList.appendChild(propListItem);
            break;
          case prop === "description":
            propListItem.innerHTML = `<u>Description:</u> <br> <br> ${item[prop]}`;
            hiddenContentList.appendChild(propListItem);
            break;
          case prop === "deadline":
            propListItem.innerHTML = `<u>Deadline:</u> <br> <br> ${item.formattedDate}`;
            hiddenContentList.appendChild(propListItem);
            break;
          case prop === "priority":
            propListItem.innerHTML = `<u>Priority:</u> <br> <br> ${item[prop]}`;
            hiddenContentList.appendChild(propListItem);
            break;
          case prop === "notes":
            if (item[prop].length > 0) {
              propListItem.innerHTML = `<u>Notes:</u> <br> <br> ${item[prop]}`;
              hiddenContentList.appendChild(propListItem);
            } else {
              propListItem = undefined;
            }
            break;
          case prop === "checklist":
            if (Object.keys(item[prop]).length > 0) {
              const hiddenChecklist = document.createElement("ul");
              const hiddenChecklistPara = document.createElement("p");
              hiddenChecklistPara.innerHTML = "Checklist:";
              for (const checkItem in item[prop]) {
                const hiddenChecklistItem = document.createElement("li");
                hiddenChecklistItem.classList.add("hidden-list-item");
                hiddenChecklistItem.innerHTML = `${checkItem}`;
                hiddenChecklist.appendChild(hiddenChecklistItem);
              }
              propListItem.appendChild(hiddenChecklistPara);
              propListItem.appendChild(hiddenChecklist);
              hiddenContentList.appendChild(propListItem);
            }
            break;
          case prop === "tasks":
            if (item[prop].length > 0) {
              const hiddenTaskListPara = document.createElement("p");
              hiddenTaskListPara.innerHTML = "<u>Tasks:</u> <br> <br>";
              const hiddenTaskList = document.createElement("ul");
              item[prop].forEach((task) => {
                // gets the task from the task-library based on the task-ID
                TaskLibrary.show().forEach((obj) => {
                  if (obj.id === task) {
                    const listItem = document.createElement("li");
                    listItem.classList.add("hidden-list-item");
                    const taskItem = document.createElement("input");
                    taskItem.type = "checkbox";
                    taskItem.id = obj.title;
                    taskItem.name = obj.title;
                    taskItem.value = obj.id;
                    // checks the box if the task is complete
                    if (obj.complete === true) {
                      taskItem.checked = true;
                    }
                    // updates the tasks 'complete' property when the box is checked
                    taskItem.addEventListener("click", () => {
                      obj.toggleComplete();
                      saveEditTask(appConfig, obj, () => {
                        dynamicExplorerParts.refreshItemList(appConfig, "project");
                      });
                    });
                    const taskLabel = document.createElement("label");
                    taskLabel.setAttribute("for", obj.title);
                    let title = obj.title;
                    if (obj.title.length > 30) {
                      title = `${obj.title
                        .split(" ")
                        .slice(0, 7)
                        .join(" ")}...`;
                    }
                    taskLabel.innerHTML = title;
                    listItem.appendChild(taskItem);
                    listItem.appendChild(taskLabel);
                    hiddenTaskList.appendChild(listItem);
                  }
                });
              });
              propListItem.appendChild(hiddenTaskListPara);
              propListItem.appendChild(hiddenTaskList);
            }
            hiddenContentList.appendChild(propListItem);
            break;
          case prop === "complete":
            if (item[prop] === true) {
              hiddenDiv.classList.add("completed");
            }
            break;
          case prop === "id":
          case prop === "key":
          case prop === "_hidden":
            break;
          default:
            console.error("unknown property", prop);
        }
      }

      const hiddenButtonDiv = document.createElement("div");
      hiddenButtonDiv.appendChild(completeButton);
      hiddenButtonDiv.appendChild(editButton);
      hiddenButtonDiv.appendChild(removeButton);
      hiddenButtonDiv.classList.add("hidden-button-div");

      editButton.addEventListener("click", () => {
        const explorer = document.getElementById("explorer-frame");
        explorer.style.display = "none";
        if (item.constructor === Task) {
          editTaskMenu(appConfig, item);
          // explorer.remove();
        } else if (item.constructor === Project) {
          editProjectMenu(appConfig, item);
          // explorer.remove();
        }
      });
      completeButton.addEventListener("click", () => {
          item.toggleComplete();
        if (item.constructor === Task) {
          saveEditTask(appConfig, item, () => {
          });
        } else if (item.constructor === Project) {
          saveEditProject(appConfig, item, () => {
          });
        }
        hiddenDiv.classList.toggle("completed");
        completeButton.classList.toggle("complete-button-active");
      });
      removeButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to remove?") === true) {
          if (item.constructor === Task) {
            deleteTask(appConfig, item, () => renderListToNav(TaskLibrary.show(), "task"));
          } else if (item.constructor === Project) {
            deleteProject(appConfig, item, () => renderListToNav(ProjectLibrary.show(), "project"));
          }
          listItem.remove();
        }
      });

      hiddenDiv.appendChild(hiddenContentList);
      hiddenDiv.appendChild(hiddenButtonDiv);

      listItem.appendChild(collapsible);
      listItem.appendChild(hiddenDiv);
      list.appendChild(listItem);
    });

    parent.appendChild(list);
    // eslint-disable-next-line no-new
    new SimpleBar(document.getElementById("explorer-list"));
  };
  const refreshItemList = (appConfig, str) => {
    const listContainer = document.getElementById("list-container");
    if (str === "task") {
      listContainer.removeChild(listContainer.childNodes[0]);
      itemList(appConfig, listContainer, TaskLibrary.show());
    } else if (str === "project") {
      listContainer.removeChild(listContainer.childNodes[0]);
      itemList(appConfig, listContainer, ProjectLibrary.show());
    }
  };
  const buttons = (parent) => {
    const div = document.createElement("div");
    div.id = "explorer-buttons";

    const expand = document.createElement("button");
    expand.innerHTML = "expand all";
    expand.classList.add("styled-button");
    expand.classList.add("form-button");

    expand.addEventListener("click", () => {
      Array.from(
        document.getElementsByClassName("collapsible-content")
      ).forEach((item) => {
        item.style.display = "grid";
        if (!item.previousSibling.classList.contains("active")) {
          item.previousSibling.classList.toggle("active");
        }
      });
    });

    const retract = document.createElement("button");
    retract.innerHTML = "collapse all";
    retract.classList.add("styled-button");
    retract.classList.add("form-button");

    retract.addEventListener("click", () => {
      Array.from(
        document.getElementsByClassName("collapsible-content")
      ).forEach((item) => {
        item.style.display = "none";
        if (item.previousSibling.classList.contains("active")) {
          item.previousSibling.classList.toggle("active");
        }
      });
    });

    dynamicFormParts.cancelButton(div, clearContent);
    div.appendChild(expand);
    div.appendChild(retract);

    parent.appendChild(div);
  };

  return {
    explorerFrame,
    explorerTabs,
    itemList,
    refreshItemList,
    buttons
  };
})();

// renders date to body of page
const renderBigDate = (() => {
  let initialized = false;
  return (appConfig) => {
    if (initialized) {
      throw new Error("already exists");
    }
    initialized = true;
    const dateHero = document.createElement("div");
    dateHero.id = "date-hero";
    const dateToday = document.createElement("h2");
    dateToday.id = "date-today";
    const startButton = document.createElement("button");
    startButton.id = "start-button";
    startButton.innerHTML = "get to work";
    startButton.classList.add("styled-button", "py-3", "px-6");

    dateHero.appendChild(dateToday);
    dateHero.appendChild(startButton);
    content.appendChild(dateHero);
    let timer;

    dayjs.extend(advancedFormat)
    function updateTime() {
      dateToday.innerHTML = `${dayjs().format(
        "dddd, [the] Do<br />[of] MMMM<br />h:mmA"
      )}`;
      timer = setTimeout(updateTime, 60000);
    }

    function stop() {
      clearTimeout(timer);
      timer = 0;
    }

    startButton.addEventListener("click", () => {
      stop();
      taskExplorer(appConfig);
      dateHero.remove();
    });
    return {
      updateTime,
      stop
    };
  };
})();

// creates task explorer
const taskExplorer = (appConfig) => {
  dynamicExplorerParts.explorerFrame();
  const explorer = document.getElementById("explorer");
  dynamicExplorerParts.explorerTabs(appConfig, explorer);
  const listContainer = document.createElement("div");
  listContainer.id = "list-container";
  explorer.appendChild(listContainer);
  dynamicExplorerParts.itemList(appConfig, listContainer, TaskLibrary.show());
  dynamicExplorerParts.buttons(explorer);
};
/** creating a form to make a new task
 *  @param {AppConfig} appConfig
 */
const taskCreationMenu = (appConfig) => {
  const inputClassName = "task-creation-input";
  dynamicFormParts.newFormWindow("Task", "New Task");
  const form = document.getElementById("task-form");
  form.classList.add("data-entry");
  dynamicFormParts.newTextInput(
    form,
    "title",
    "Title.",
    "Enter task name...",
    true,
    [inputClassName]
  );
  dynamicFormParts.newTextInput(
    form,
    "description",
    "Details.",
    "Details...",
    true,
    [inputClassName]
  );
  dynamicFormParts.newDateInput(form, [inputClassName]);
  dynamicFormParts.newPriorityDropdown(form, 5, [inputClassName]);
  dynamicFormParts.newTextInput(
    form,
    "notes",
    "Notes.",
    "Additional notes...",
    false,
    [inputClassName]
  );
  const div = document.createElement("div");
  div.classList.add("form-buttons");
  div.id = "task-buttons";
  dynamicFormParts.submitButton(appConfig, div);
  dynamicFormParts.cancelButton(div, clearContent);
  form.appendChild(div);
};

// creating a form to make edit a task
const editTaskMenu = (appConfig, obj) => {
  let title = obj.title;
  if (obj.title.length > 20) {
    title = `${obj.title.split(" ").slice(0, 4).join(" ")}...`;
  }
  dynamicFormParts.newFormWindow("task-edit", `Edit ${title}`);
  const form = document.getElementById("task-edit-form");
  form.classList.add("data-entry");
  dynamicFormParts.newTextInput(form, "description", "Details.", "", true, []);
  dynamicFormParts.newDateInput(form, [], obj.formattedDate);
  dynamicFormParts.newPriorityDropdown(form, 5, []);
  dynamicFormParts.newTextInput(form, "notes", "Notes.", "", false, []);
  const div = document.createElement("div");
  div.classList.add("form-buttons");
  div.id = "task-buttons";
  dynamicFormParts.saveButton(appConfig, div, obj);
  dynamicFormParts.cancelButton(div, () => {
    document.getElementById("explorer-frame").style.display = "flex";
    document.getElementById("form-container").remove();
  });
  form.appendChild(div);
  document.getElementById("description").value = obj.description;
  document.getElementById("priority").value = obj.priority;
  document.getElementById("notes").value = obj.notes;
};

/**
 * creating a form to make a new project
 * @param {AppConfig} appConfig
 */
const projectCreationMenu = (appConfig) => {
  const inputClassName = "project-creation-input";
  dynamicFormParts.newFormWindow("Project", "New Project");
  const form = document.getElementById("project-form");
  form.classList.add("data-entry");
  dynamicFormParts.newTextInput(
    form,
    "title",
    "Title.",
    "Enter project name...",
    true,
    [inputClassName]
  );
  dynamicFormParts.newTextInput(
    form,
    "description",
    "Details.",
    "Details...",
    true,
    [inputClassName]
  );
  dynamicFormParts.newDateInput(form, [inputClassName]);
  dynamicFormParts.newTextInput(
    form,
    "notes",
    "Notes.",
    "Additional notes...",
    false,
    [inputClassName]
  );
  dynamicFormParts.newTasklist(form, undefined, []);
  // eslint-disable-next-line no-new
  new SimpleBar(document.getElementById("checkboxes"), { autoHide: false });
  const div = document.createElement("div");
  div.classList.add("form-buttons");
  div.id = "project-buttons";
  dynamicFormParts.submitButton(appConfig, div);
  dynamicFormParts.cancelButton(div, clearContent);
  const footNote = document.createElement("p");
  footNote.id = "project-form-footnote";
  footNote.innerHTML =
    "*Additional tasks can be added later from the project explorer";
  form.appendChild(footNote);
  form.appendChild(div);
};

// creating a form to make edit a task
const editProjectMenu = (appConfig, obj) => {
  let title = obj.title;
  if (obj.title.length > 20) {
    title = `${obj.title.split(" ").slice(0, 4).join(" ")}...`;
  }
  dynamicFormParts.newFormWindow("project-edit", `Edit ${title}`);
  const form = document.getElementById("project-edit-form");
  form.classList.add("data-entry");
  dynamicFormParts.newTextInput(form, "description", "Details.", "", true, []);
  dynamicFormParts.newDateInput(form, [], obj.formattedDate);
  dynamicFormParts.newTasklist(form, obj);
  // eslint-disable-next-line no-new
  new SimpleBar(document.getElementById("checkboxes"), { autoHide: false });
  dynamicFormParts.newTextInput(form, "notes", "Notes.", "", false, []);
  const div = document.createElement("div");
  div.classList.add("form-buttons");
  div.id = "task-buttons";
  dynamicFormParts.saveButton(appConfig, div, obj);
  dynamicFormParts.cancelButton(div, () => {
    document.getElementById("form-container").remove();
    document.getElementById("explorer-frame").style.display = "flex";
  });
  form.appendChild(div);
  document.getElementById("description").value = obj.description;
  document.getElementById("notes").value = obj.notes;
};
// clears the form from the main menu
const clearContent = () => {
  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }
};

// renders the five tasks or projects, that are due the soonest, to the navbar
const renderListToNav = (library, target) => {
  if (typeof target !== "string") {
    return;
  }
  const list = document.getElementById(`${target}-list`);
  list.innerHTML = "";
  const listItem = document.createElement("li");
  listItem.classList.add("nav-list-item");
  const temp = [...library];
  const topFive = [];
  temp.forEach((item) => {
    if (topFive.length === 0) {
      topFive.push(item);
    } else {
      dayjs.extend(isSameOrAfter)
      for (let i = topFive.length - 1; i >= 0; i--) {
        const test = dayjs(
          item.deadline
        ).isSameOrAfter(
          topFive[i].deadline
        );
        if (test) {
          if (i >= 4) {
            break;
          } else {
            topFive.splice(i + 1, 0, item);
            break;
          }
        } else if (i === 0) {
          topFive.unshift(item);
        }
      }
    }
    if (topFive.length > 5) {
      topFive.pop();
    }
  });
  topFive.forEach((item) => {
    let title = item.title;
    if (item.title.length > 20) {
      title = `${item.title.split(" ").slice(0, 4).join(" ")}...`;
    }
    const newListItem = listItem.cloneNode();
    newListItem.innerHTML = title;
    list.appendChild(newListItem);
  });
};

function openSignIn() {
  const overlay = document.createElement("app-overlay");
  const modal = document.createElement("app-sign-in-modal");
  overlay.appendChild(modal);

  document.body.appendChild(overlay);
}

const signInPopup = (parent, signIn, localSession) => {
  const pageSplash = document.createElement("div");
  pageSplash.id = "sign-in-page-splash";
  parent.appendChild(pageSplash);
  pageSplash.innerHTML = `
    <div class="box-border data-entry" style="box-sizing: border-box;">
        <div class="flex-row">
            <button id="sign-in-button" class="styled-button">sign in</button>
            <button id="local-session-button" class="styled-button">work offline</button>
        </div>
        <span>*signing in will not erase local data</span>
   </div>
`;
  document.getElementById("sign-in-button").addEventListener("click", () => {
    openSignIn();
    pageSplash.remove();
  });
  document
    .getElementById("local-session-button")
    .addEventListener("click", () => localSession(pageSplash));
};

export {
  renderStaticElements,
  renderBigDate,
  taskCreationMenu,
  projectCreationMenu,
  signInPopup,
  openSignIn,
  renderListToNav
};
