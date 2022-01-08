import { compareAsc, format, parseISO } from 'date-fns';
import './pageFunctions.js';
import { addNewProject, addNewTask, stateManager, taskLibrary, projectLibrary, sortAlg } from './pageFunctions.js';


const content = document.getElementById('content');



const renderStaticElements = () => {

    // ref for static elements to append to
    const page = document.getElementById('page');

    // renders the sidebar
    (() => {    
        const nav = document.createElement('nav');
        nav.id = 'sidebar';
    
        const header = document.createElement('h1');
        header.id = 'title';
        header.innerHTML = 'Do.';
    
        const taskContainer = document.createElement('div');
        taskContainer.id = 'task-container';
        const taskHeader = document.createElement('h2');
        taskHeader.id = 'task-header';
        taskHeader.innerHTML = 'Tasks';
        taskContainer.appendChild(taskHeader);
        const taskList = document.createElement('ul');
        taskList.id = 'task-list';
        taskContainer.appendChild(taskList);

        const projectContainer = document.createElement('div');
        projectContainer.id = 'project-container';
        const projectHeader = document.createElement('h2');
        projectHeader.id = 'project-header';
        projectHeader.innerHTML = 'Projects';
        projectContainer.appendChild(projectHeader);
        const projectList = document.createElement('ul');
        projectList.id = 'project-list';
        projectContainer.appendChild(projectList);
    
        const newNavButton = (name) => {
          let button = document.createElement('button');
          button.id = `new-${name.toLowerCase()}-button`;
          button.classList.add('nav-button');
          button.innerHTML = `New ${name} >>`;
          nav.appendChild(button);
        }
    
        
        nav.appendChild(header);
        nav.appendChild(taskContainer);
        newNavButton('Task');
        nav.appendChild(projectContainer);
        newNavButton('Project');
        
        page.prepend(nav);
        renderListToNav(taskLibrary.show(), 'task');
        renderListToNav(projectLibrary.show(), 'project');
    })();

};


const dynamicFormParts = (() => {

        // create the popup for adding new tasks
    const newFormWindow = (type) => {

        const container = document.createElement('div');
        container.id = 'form-container';

        const formHeader = document.createElement('h3');
        formHeader.innerHTML = `New ${type}`;

        const form = document.createElement('form');
        form.name = `${type} creation form`;
        form.id = `${type.toLowerCase()}-form`;

        form.appendChild(formHeader);
        container.appendChild(form);
        content.appendChild(container);
    };

        // creates a text input when called
    const newTextInput = (parent, name, labelText, placeholder, required) => {
        const label = document.createElement('label');
        label.for = name;
        label.innerHTML = labelText;
        const input = document.createElement('input');
        input.id = name;
        input.type = 'text';
        input.placeholder = placeholder;
        
        if (required) {
            input.required = true;
        }

        parent.appendChild(label);
        parent.appendChild(input);
    }

        // creates a date input when called
    const newDateInput = (parent) => {
        const label = document.createElement('label');
        label.for = 'due-date';
        label.innerHTML = 'Deadline.';
        const input = document.createElement('input');
        input.id = 'due-date';
        input.type = 'date';
        input.min = `${format(new Date(), 'yyyy-MM-dd')}`;
        input.value = `${format(new Date(), 'yyyy-MM-dd')}`;
        input.required = true;

        parent.appendChild(label);
        parent.appendChild(input);
    }

        // dropdown menu for selecting the priority
    const newPriorityDropdown = (parent, maxScale) => {
        const label = document.createElement('label');
        label.for = 'priority';
        label.innerHTML = 'Priority.';
        const input = document.createElement('select');
        input.id = 'priority';
        for (let i = 1; i <= maxScale; i++) {
            let newOption = document.createElement('option');
            newOption.value = i.toString();
            newOption.innerHTML = i.toString()
            input.appendChild(newOption);
        }
        parent.appendChild(label);
        parent.appendChild(input);
    }

        // input for a task checklist
    const newChecklist = (parent) => {
        const label = document.createElement('label');
        label.for = 'checklist';
        label.innerHTML = 'Checklist.';
        const listDiv = document.createElement('div');
        listDiv.id = 'checklist-div'
        const listUl = document.createElement('ul');
        listUl.id = 'checklist-list';
        let textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.placeholder = 'Add an item...';
        textInput.id = 'checklist-text-input'
        const buttonDiv = document.createElement('div');
        buttonDiv.classList.add('form-buttons');
        const addItem = document.createElement('button');
        addItem.type = 'button';
        addItem.innerHTML = 'add >>';
        const removeItem = document.createElement('button');
        removeItem.type = 'button';
        removeItem.innerHTML = 'remove >>';
        addItem.addEventListener('click', function(e){
            e.preventDefault();
            if (textInput.value.length > 0){
                let listItem = document.createElement('li');
                listItem.classList.add('checklist-item');
                listItem.innerHTML = '- ' + textInput.value;
                listUl.appendChild(listItem);
                textInput.value = '';
            }
        });
        removeItem.addEventListener('click', function(e){
            e.preventDefault();
            if (listUl.childElementCount > 0) {
                listUl.removeChild(listUl.lastElementChild);
            }
        })

        buttonDiv.appendChild(addItem);
        buttonDiv.appendChild(removeItem);

        listDiv.appendChild(listUl);
        listDiv.appendChild(textInput);
        listDiv.appendChild(buttonDiv);

        parent.appendChild(label);
        parent.appendChild(listDiv);
        
    };

    const newTasklist = (parent) => {
      const label = document.createElement('label');
      label.setAttribute('for', 'checkboxes'); 
      label.innerHTML = 'Tasks.';
      const listDiv = document.createElement('div');
      listDiv.id = 'tasklist-div'
      const checkboxes = document.createElement('ul');
      checkboxes.id = 'checkboxes';

      const checkBox = document.createElement('input');
      checkBox.type = 'checkbox';
      const checkboxLabel = document.createElement('label');

      let items = [...taskLibrary.show()];
      console.log(sortAlg.timeAsc(items));

      sortAlg.timeAsc(items).map((item) => {
        let listItem = document.createElement('li');
        listItem.classList.add('task-list-item');

        let cloneCheckbox = checkBox.cloneNode();
        cloneCheckbox.id = `${item.identifier}`;
        cloneCheckbox.value = `${item.identifier}`;

        let cloneCheckboxLabel = checkboxLabel.cloneNode();
        
        cloneCheckboxLabel.setAttribute('for', `${item.identifier}`);
        cloneCheckboxLabel.innerHTML = `${item.title}`;

        listItem.appendChild(cloneCheckbox);
        listItem.appendChild(cloneCheckboxLabel);
        checkboxes.appendChild(listItem);
      })


      listDiv.appendChild(label);
      listDiv.appendChild(checkboxes);

      parent.appendChild(listDiv);
      
  };

        // form submit button
    const submitButton = (parent) => {
        const submitButton = document.createElement('button');
        submitButton.type = 'button';
        submitButton.innerHTML = 'create >>';
        submitButton.addEventListener('click', () => {
          
          if (parent.id === 'task-buttons') {
            addNewTask();
            if (stateManager.getAdded()) {
              renderListToNav(taskLibrary.show(), 'task');
              clearContent();
              stateManager.setAdded(false);
            }
          } else if (parent.id === 'project-buttons') {
              addNewProject();
              if (stateManager.getAdded()) {
                renderListToNav(projectLibrary.show(), 'project');
                clearContent();
                stateManager.setAdded(false);
              }
          }
        });
        parent.appendChild(submitButton);
    };

        // form cancel button
    const cancelButton = (parent) => {
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.innerHTML = 'cancel >>';
        cancelButton.addEventListener('click', () => {
            clearContent();
        });
        parent.appendChild(cancelButton);
    };


    return {
        newFormWindow,
        newTextInput,
        newDateInput,
        newPriorityDropdown,
        newChecklist,
        newTasklist,
        submitButton,
        cancelButton
    }


})();

const dynamicExplorerParts = (() => {
  const explorerFrame = () => {
    const explorer = document.createElement('div');
    explorer.id = 'explorer';    
    content.appendChild(explorer);
  }

  const explorerTab = () => {
    const div = document.createElement('div');

    div.id = 'tab'

  } 

  const itemList = (library, parent) => {
    const list = document.createElement('ul');
    list.id = 'explorer-list';



    library.map(item => {
      let listItem = document.createElement('li');
      listItem.classList.add('explorer-list-item');
      listItem.id = item.identifier;
      list.appendChild(listItem);
    })

    parent.appendChild(list);
  }
  

  

  return {
    explorerFrame,
    explorerTab,
    itemList,
  }
})()

// renders date to body of page
const renderBigDate = (() => {
    const dateHero = document.createElement('div');
    dateHero.id = 'date-hero';
    const dateToday = document.createElement('h2');
    dateToday.id = 'date-today';
    const startButton = document.createElement('button');
    startButton.id = 'start-button';
    startButton.innerHTML = 'Get Started >>';


    dateHero.appendChild(dateToday);
    dateHero.appendChild(startButton);
    content.appendChild(dateHero);
    let timer;
    function updateTime() {
    dateToday.innerHTML = `${format(new Date(), "EEEE', the 'do'<br />of 'MMMM")} <br />
                            ${format(new Date(), "p")}`;
    timer = setTimeout(updateTime, 60000);
    }
    function stop() {
        clearTimeout(timer);
        timer = 0;
    }
    startButton.addEventListener('click', () => {
      stop();
      taskExplorer();
      dateHero.remove();
      console.log(dateHero);
    })
    return {
        updateTime,
        stop,
    }
})();

// creates task explorer
const taskExplorer = () => {

  dynamicExplorerParts.explorerFrame();
  const explorer = document.getElementById('explorer-frame');

}
// creating a form to make a new task
const taskCreationMenu = () => {
    dynamicFormParts.newFormWindow('Task');
    let form = document.getElementById('task-form');
    form.classList.add('data-entry');
    dynamicFormParts.newTextInput(form, 'title', 'Title.', 'Enter task name...', true);
    dynamicFormParts.newTextInput(form, 'description', 'Details.', 'Details...', true);
    dynamicFormParts.newDateInput(form);
    dynamicFormParts.newPriorityDropdown(form, 5);
    dynamicFormParts.newChecklist(form);
    dynamicFormParts.newTextInput(form, 'notes', 'Notes.', 'Additional notes...', false);
    const div = document.createElement('div');
    div.classList.add('form-buttons');    
    div.id = 'task-buttons';      
    dynamicFormParts.submitButton(div);
    dynamicFormParts.cancelButton(div);
    form.appendChild(div);
};

// creating a form to make a new project
const projectCreationMenu = () => {
  dynamicFormParts.newFormWindow('Project');
  let form = document.getElementById('project-form');
  form.classList.add('data-entry');
  dynamicFormParts.newTextInput(form, 'title', 'Title.', 'Enter project name...', true);
  dynamicFormParts.newTextInput(form, 'description', 'Details.', 'Details...', true);
  dynamicFormParts.newDateInput(form);
  dynamicFormParts.newTextInput(form, 'notes', 'Notes.', 'Additional notes...', false);
  dynamicFormParts.newTasklist(form);
  const div = document.createElement('div');
  div.classList.add('form-buttons');
  div.id = 'project-buttons';        
  dynamicFormParts.submitButton(div);
  dynamicFormParts.cancelButton(div);
  const footNote = document.createElement('p');
  footNote.id = 'project-form-footnote';
  footNote.innerHTML = '*Additional tasks can be added later from the project screen';
  form.appendChild(footNote);
  form.appendChild(div);
}

// clears the form from the main menu
const clearContent = () => {
    document.getElementById('form-container').remove();
};

// renders the five tasks or projects, that are due the soonest, to the navbar

const renderListToNav = (library, target) => {
  const list = document.getElementById(`${target}-list`);
  list.innerHTML = '';
  const listItem = document.createElement('li');
  let temp = [...library];
  let topFive = [];
  temp.map(item => {
    if (topFive.length === 0){
      topFive.push(item);
    } else {
      for (let i= topFive.length - 1; i >= 0; i--){
        let test = compareAsc(parseISO(item.dueDate), parseISO(topFive[i].dueDate));
        if (test === 1 || test === 0) {
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
  topFive.map(item => {
      let newListItem = listItem.cloneNode();
      newListItem.innerHTML = item.title;        
      list.appendChild(newListItem);
  });
}

export {
    renderStaticElements,
    renderBigDate,
    taskCreationMenu,
    projectCreationMenu,
    clearContent,
    renderListToNav,
};