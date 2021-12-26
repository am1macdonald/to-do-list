import { Task, Project } from './todo.js';
import { format } from 'date-fns';
import './pageFunctions.js';
import { addNewTask } from './pageFunctions.js';



const renderStaticElements = () => {

        // ref for static elements to append to
    const page = document.getElementById('page');


        // renders the background
    const renderBackground = (() => {
        const backgroundImg = document.createElement('IMG');
        const imgDiv = document.createElement('div');
        imgDiv.id = 'img-div';
        backgroundImg.setAttribute('src', "./414f227d270f533c6661.png");
        backgroundImg.setAttribute('alt', "A background Picture");
        imgDiv.appendChild(backgroundImg);
        page.prepend(imgDiv);
    })();
    
        // renders the sidebar
    const renderSidebar = (() => {    
        const nav = document.createElement('nav');
        nav.id = 'sidebar';
    
        const header = document.createElement('h1');
        header.id = 'title';
        header.innerHTML = 'Get on it.';
    
        const taskContainer = document.createElement('div');
        taskContainer.id = 'task-container';
    
        const newTaskButton = document.createElement('button');
        newTaskButton.id = 'new-task-button';
        newTaskButton.innerHTML = 'New Task';
    
        nav.appendChild(header);
        nav.appendChild(taskContainer);
        nav.appendChild(newTaskButton);
        
        page.prepend(nav);
    })();
};

    // ref for dynamically rendered elements to append to
const content = document.getElementById('content');



const renderDynamicParts = (() => {

        // create the popup for adding new tasks
    const newFormWindow = (type) => {

    const formOverlay = document.createElement('div');
    formOverlay.id = 'form-overlay';

    const container = document.createElement('div');
    container.id = 'form-container';

    const formHeader = document.createElement('h3');
    formHeader.innerHTML = `New ${type}`;

    const form = document.createElement('form');
    form.name = `${type} creation form`;
    form.id = `${type.toLowerCase()}-form`;

    form.appendChild(formHeader);
    container.appendChild(form);
    formOverlay.appendChild(container);
    content.appendChild(formOverlay);
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
        label.innerHTML = 'What is the deadline?';
        const input = document.createElement('input');
        input.id = 'due-date';
        input.type = 'date';
        input.min = `${format(new Date(), 'yyyy-MM-dd')}`;
        input.value = `${format(new Date(), 'yyyy-MM-dd')}`
        input.required = true;

        parent.appendChild(label);
        parent.appendChild(input);
    }

        // dropdown menu for selecting the priority
    const newPriorityDropdown = (parent, maxScale) => {
        const label = document.createElement('label');
        label.for = 'priority';
        label.innerHTML = 'How important is the task?';
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
        label.innerHTML = 'Checklist:';
        const listDiv = document.createElement('div');
        listDiv.id = 'checklist-div'
        const listUl = document.createElement('ul');
        listUl.id = 'checklist-list';
        let textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.id = 'checklist-text-input'
        const buttonDiv = document.createElement('div');
        const addItem = document.createElement('button');
        addItem.type = 'button';
        addItem.innerHTML = 'add';
        const removeItem = document.createElement('button');
        removeItem.type = 'button';
        removeItem.innerHTML = 'remove';
        addItem.addEventListener('click', function(e){
            e.preventDefault();
            if (textInput.value.length > 0){
                let listItem = document.createElement('li');
                listItem.classList.add('checklist-item');
                listItem.innerHTML = '- ' + textInput.value;
                listUl.appendChild(listItem);
                textInput.value = '';
            };
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

        // form submit button
    const submitButton = (parent) => {
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.innerHTML = 'Create';
        submitButton.addEventListener('click', addNewTask );

        parent.appendChild(submitButton);
    };

        // form cancel button
    const cancelButton = (parent) => {
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.innerHTML = 'Cancel';
        cancelButton.addEventListener('click', () => {
            wipeForm();
        });
        parent.appendChild(cancelButton);
    };


    return {
        newFormWindow,
        newTextInput,
        newDateInput,
        newPriorityDropdown,
        newChecklist,
        submitButton,
        cancelButton
    }


})();

/*
        // button to submit the details and invoke function to make a new task object
const submitButton = document.createElement('button');
submitButton.type = 'submit';
submitButton.innerHTML = 'Create';
submitButton.addEventListener('click', addNewTask );

const cancelButton = document.createElement('button');
cancelButton.type = 'button';
cancelButton.innerHTML = 'Cancel';
cancelButton.addEventListener('click', () => {
    wipeForm();
});
*/
                
        // appending all elements to the DOM
const taskCreationMenu = () => {
    renderDynamicParts.newFormWindow('Task');
    let form = document.getElementById('task-form');
    renderDynamicParts.newTextInput(form, 'title', 'Title:', 'What needs doing?', true);
    renderDynamicParts.newTextInput(form, 'description', 'Description:', 'What are the details?', true);
    renderDynamicParts.newDateInput(form);
    renderDynamicParts.newPriorityDropdown(form, 5);
    renderDynamicParts.newChecklist(form);
    renderDynamicParts.newTextInput(form, 'notes', 'Notes:', 'Any additional details?', false);            
    renderDynamicParts.submitButton(form);
    renderDynamicParts.cancelButton(form);
    //form.appendChild(submitButton);
    //form.appendChild(cancelButton);         
}

const wipeForm = () => {
    document.getElementById('form-overlay').remove();
}




export {
    renderStaticElements,
    taskCreationMenu,
    wipeForm,
}