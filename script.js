// Initalize some variables

let currentTask;
let currentList = 'Personal';

// Factories

const Task = (task, selectedList, taskNotes, taskPriority, taskDate, taskCreated) => {
  let description = task;
  let list = selectedList;
  let notes = taskNotes;
  let priority = taskPriority;
  let dueDate = taskDate;
  let labels = [];
  let created = taskCreated;
  return { description, list, notes, priority, dueDate, labels, created };
}

const List = (list) => {
  let description = list;
  return { description };
}

// DOM manipulation

const display = (() => {

  // Initalize DOM variables that we will be using in multiple sections
  const input = document.querySelector('.input-task');
  const modal = document.querySelector('.task-modal');
  const labelInput = document.querySelector('.label-input');
  const dateInput = document.querySelector('.duedate-calendar');
  const textArea = document.querySelector('textarea');
  const lowPriority = document.querySelector('#low-priority');
  const medPriority = document.querySelector('#med-priority');
  const highPriority = document.querySelector('#high-priority');
  const blurContainer = document.querySelector('.blur-container');
  const editModal = document.querySelector('.edit-list-modal');
  const deleteModal = document.querySelector('.delete-list-modal');


  /// Add a Task DOM
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      if (input.value == '') return;
      createTask(input.value, true);
    }
  });

  const addBtn = document.querySelector('.add-task-button');
  addBtn.addEventListener('click', function () {
    if (input.value == '') return;
    createTask(input.value, true);
  });

  const createTask = (task, addToArray, priorityFlag) => {
    const taskContainer = document.querySelector('.task-container');
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task');
    const taskButton = document.createElement('button');
    taskButton.classList.add('task-button');
    taskDiv.appendChild(taskButton);
    const taskText = document.createElement('div');
    taskText.classList.add('task-text');
    taskText.textContent = task;
    taskDiv.append(taskText);
    taskContainer.appendChild(taskDiv);
    const deleteContainer = document.createElement('div');
    deleteContainer.classList.add('delete-container');
    const deletePng = document.createElement('img');
    deletePng.setAttribute('src', 'assets/delete.png');
    deleteContainer.appendChild(deletePng);
    taskDiv.appendChild(deleteContainer);
    // Priority
    switch (priorityFlag) {
      case 'low':
        taskDiv.style.background = 'rgba(186, 255, 201, 1)';
        break;
      case 'med':
        taskDiv.style.background = 'rgba(255, 255, 186, 1)';
        break;
      case 'high':
        taskDiv.style.background = 'rgba(255, 179, 186, 1)';
    }


    taskDiv.addEventListener('mouseenter', function () {
      deleteContainer.style.display = 'block';
      currentList = getTaskListing(task);    
    });

    taskDiv.addEventListener('mouseleave', function () {
      deleteContainer.style.display = 'none';
    });

    deleteContainer.addEventListener('click', function () {
      deleteTask(task);
    });

    taskButton.addEventListener('click', function () {
      if (!taskButton.classList.contains('task-finished')) {
        taskText.classList.add('task-strikethrough');
        taskButton.classList.add('task-finished');
        taskDiv.style.opacity = '70%';
      } else {
        taskText.classList.remove('task-strikethrough');
        taskButton.classList.remove('task-finished');
        taskDiv.style.opacity = '100%';
      }

    });

    // Task details Modal
    taskText.addEventListener('click', function () {
      if (modal.style.display == 'none') {
        modal.style.display = 'flex';
        currentTask = task;
        fillModal(task);
      } else {
        modal.style.display = 'none';
      }
    });

    input.value = '';
    if (addToArray) newTask(task);
  }

  const fillModal = task => {
    const modalHeader = document.querySelector('.modal-header');

    // Fill header
    modalHeader.textContent = task;

    // Fill labels
    let l = getTaskLabels(currentTask);
    if (l == '') {
      const labelDivs = document.querySelectorAll('.task-label');
      labelDivs.forEach(div => div.remove());
    } else {
      const labelDivs = document.querySelectorAll('.task-label');
      labelDivs.forEach(div => div.remove());
      for (let i = 0; i < l.length; i++) {
        createLabel(l[i]);
      }
    }

    // Fill due date

    if (getTaskDueDate(task) == undefined) {
      dateInput.value = '';
    } else {
      dateInput.value = '';
      dateInput.value = getTaskDueDate(task);
    }

    // Fill priority
    switch (getTaskPriority(task)) {
      case 'undefined':
        medPriority.classList.remove('priority-highlight');
        highPriority.classList.remove('priority-highlight');
        lowPriority.classList.remove('priority-highlight');
        break;
      case 'low':
        medPriority.classList.remove('priority-highlight');
        highPriority.classList.remove('priority-highlight');
        lowPriority.classList.add('priority-highlight');
        break;
      case 'med':
        lowPriority.classList.remove('priority-highlight');
        highPriority.classList.remove('priority-highlight');
        medPriority.classList.add('priority-highlight');
        break;
      case 'high':
        lowPriority.classList.remove('priority-highlight');
        medPriority.classList.remove('priority-highlight');
        highPriority.classList.add('priority-highlight');
        break;
    }

    // Fill notes
    if (getTaskNotes(task) == undefined) {
      textArea.value = '';
    } else {
      textArea.value = '';
      textArea.value = getTaskNotes(task);
    }
  }

  // Task Detail event listeners

  labelInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      if (labelInput.value == '') return;
      updateTaskLabels(currentTask, labelInput.value);
      createLabel(labelInput.value);
      renderLabels();
    }
  });

  lowPriority.addEventListener('click', function () {
    updateTaskPriority(currentTask, 'low');
    medPriority.classList.remove('priority-highlight');
    highPriority.classList.remove('priority-highlight');
    lowPriority.classList.add('priority-highlight');
    renderTasks();
  });

  medPriority.addEventListener('click', function () {
    updateTaskPriority(currentTask, 'med');
    lowPriority.classList.remove('priority-highlight');
    highPriority.classList.remove('priority-highlight');
    medPriority.classList.add('priority-highlight');
    renderTasks();
  });

  highPriority.addEventListener('click', function () {
    updateTaskPriority(currentTask, 'high');
    lowPriority.classList.remove('priority-highlight');
    medPriority.classList.remove('priority-highlight');
    highPriority.classList.add('priority-highlight');
    renderTasks();
  });

  // Labels
  const createLabel = (label) => {
    const labelList = document.querySelector('.label-list');
    const div = document.createElement('div');
    div.classList.add('task-label');
    div.textContent = `#${label}`;
    labelList.appendChild(div);
    labelInput.value = '';
  }


  // Lists

  const addList = document.querySelector('.add-list-input');
  addList.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      if (addList.value == '') return;
      for (let i = 0; i < lists.length; i++) {
        if (lists[i].description.toLowerCase() == addList.value.toLowerCase()) return;
      }
      createList(addList.value, true);
    }
  });

  const createList = (list, addToArray) => {
    const li = document.createElement('li');
    li.classList.add('i-li');
    const div = document.createElement('div');
    div.setAttribute('id', list);
    div.classList.add('list');
    div.append(list);
    li.appendChild(div);

    if (list != 'Personal') {
      const listOptions = document.createElement('div');
      listOptions.classList.add('list-options');
      const editList = document.createElement('img');
      editList.setAttribute('src', 'assets/edit.png')
      listOptions.appendChild(editList);
      const deleteList = document.createElement('img');
      deleteList.setAttribute('src', 'assets/delete.png')
      listOptions.appendChild(deleteList);
      li.appendChild(listOptions);

      li.addEventListener('mouseenter', function () {
        listOptions.style.display = 'flex';
      });

      li.addEventListener('mouseleave', function () {
        listOptions.style.display = 'none';
      });

      editList.addEventListener('click', function () {
        blurContainer.style.display = 'block';
        editModal.style.display = 'flex';
        const input = document.querySelector('.list-edit-input');
        input.value = '';
        input.setAttribute('placeholder', list);
        activeList(list);
        renderTasks();
      });

      deleteList.addEventListener('click', function () {
        blurContainer.style.display = 'block';
        deleteModal.style.display = 'flex';
        activeList(list);
        renderTasks();
      });
    }

    const ul = document.querySelector('#ul-lists');
    ul.appendChild(li);
    addList.value = '';
    if (addToArray) newList(list);

    div.addEventListener('click', function () {
      activeList(list);
      renderTasks();
      modal.style.display = 'none';
    });



  }

  const cancelEditList = document.querySelector('.cancel-edit-list');
  cancelEditList.addEventListener('click', function () {
    blurContainer.style.display = 'none';
    editModal.style.display = 'none';
  });

  const saveList = document.querySelector('.save-list');
  saveList.addEventListener('click', function () {
    const input = document.querySelector('.list-edit-input');
    if (input.vale == '') return;
    updateLists(currentList, input.value);
    blurContainer.style.display = 'none';
    editModal.style.display = 'none';
  });

  const cancelDeleteList = document.querySelector('.cancel-delete-list');
  cancelDeleteList.addEventListener('click', function () {
    blurContainer.style.display = 'none';
    deleteModal.style.display = 'none';
  });

  const removeList = document.querySelector('.delete-list');
  removeList.addEventListener('click', function () {
    deleteList(currentList);
    blurContainer.style.display = 'none';
    deleteModal.style.display = 'none';
  });

  // Sidebar 
  // Sort

  const createSidebarLabel = (label) => {
    const div = document.createElement('div');
    div.classList.add('label-sidebar');
    div.textContent = `#${label}`;
    const labelsContainer = document.querySelector('.labels-side-container');
    labelsContainer.appendChild(div);

    div.addEventListener('click', function() {
      renderTasks(...Array(1), label);
    });
  }


  const sortPriority = document.querySelector('.sort-priority');
  sortPriority.addEventListener('click', function () {
    const sortMethod = document.querySelector('#priority-sorting');
    const sortAlphabetical = document.querySelector('#alphabetical-sorting');
    const sortDueDate = document.querySelector('#duedate-sorting');
    sortAlphabetical.textContent = '';
    sortDueDate.textContent = '';

    if (sortMethod.textContent == '') {
      sortMethod.textContent = '▲';
      sortByPriority('ascending');
    } else if (sortMethod.textContent == '▲') {
      sortMethod.textContent = '▼';
      sortByPriority('descending');
    } else if (sortMethod.textContent == '▼') {
      sortMethod.textContent = '';
      sortByDefault();
    }
  });

  const sortAlphabetical = document.querySelector('.sort-alphabetical');
  sortAlphabetical.addEventListener('click', function () {
    const sortMethod = document.querySelector('#alphabetical-sorting');
    const sortPriority = document.querySelector('#priority-sorting');
    const sortDueDate = document.querySelector('#duedate-sorting');
    sortPriority.textContent = '';
    sortDueDate.textContent = '';

    if (sortMethod.textContent == '') {
      sortMethod.textContent = '▲';
      sortByAlphabetical('ascending');
    } else if (sortMethod.textContent == '▲') {
      sortMethod.textContent = '▼';
      sortByAlphabetical('descending');
    } else if (sortMethod.textContent == '▼') {
      sortMethod.textContent = '';
      sortByDefault();
    }
  });

  const sortDueDate = document.querySelector('.sort-duedate');
  sortDueDate.addEventListener('click', function () {
    const sortMethod = document.querySelector('#duedate-sorting');
    const sortPriority = document.querySelector('#priority-sorting');
    const sortAlphabetical = document.querySelector('#alphabetical-sorting');
    sortPriority.textContent = '';
    sortAlphabetical.textContent = '';

    if (sortMethod.textContent == '') {
      sortMethod.textContent = '▲';
      sortByDueDate('ascending');
    } else if (sortMethod.textContent == '▲') {
      sortMethod.textContent = '▼';
      sortByDueDate('descending');
    } else if (sortMethod.textContent == '▼') {
      sortMethod.textContent = '';
      sortByDefault();
    }
  });

  // Sidebar cont.
  // Filter

  const filterAll = document.querySelector('.filter-all');
  filterAll.addEventListener('click', function() {
    renderTasks('viewall');
  });

  const filterPriority = document.querySelector('.filter-priority');
  filterPriority.addEventListener('click', function() {
    renderTasks('priority');
  }); 




  // Document listeners for clicking outside elements

  document.addEventListener('click', function (e) {
    let isClickInput = input.contains(e.target);
    let isClickText = textArea.contains(e.target);
    let isClickDate = dateInput.contains(e.target);
    let isClickLabel = labelInput.contains(e.target);

    if (!isClickInput) {
      addBtn.classList.remove('button-effect');
    }

    if (!isClickText) {
      updateTaskNotes(currentTask, textArea.value);
    }

    if (!isClickDate) {
      updateTaskDueDate(currentTask, dateInput.value);
    }

    if (!isClickLabel) {
      if (labelInput.value != '') {
        updateTaskLabels(currentTask, labelInput.value);
        createLabel(labelInput.value);
        renderLabels();
      }
    }
  });


  // CSS effects

  input.addEventListener('click', function () {
    addBtn.classList.add('button-effect');
  });

  const activeList = list => {
    currentList = list;
    const header = document.querySelector('.list-header');
    header.textContent = list;
  }

  // Remove DOM on render

  const clearTasks = () => {
    const tasks = document.querySelectorAll('.task');
    tasks.forEach(element => {
      element.remove();
    });
  }

  const clearLists = () => {
    const lists = document.querySelectorAll('.i-li');
    lists.forEach(list => {
      list.remove();
    });
  }

  const clearLabels = () => {
    const labels = document.querySelectorAll('.label-sidebar');
    labels.forEach(label => {
      label.remove();
    })
  }

  return { createTask, createList, clearTasks, clearLists, clearLabels, createSidebarLabel, activeList };

})();


// Render

const renderLists = () => {
  display.clearLists();
  for (let i = 0; i < lists.length; i++) {
    display.createList(lists[i].description, false);
  }
}

const renderTasks = (filter, label) => {
  display.clearTasks();

  if (filter == 'viewall') {
    for (let i=0; i<tasks.length; i++) {
      display.createTask(tasks[i].description, false, tasks[i].priority);
      renderLabels();
      
    }
    return;
  }

  if (label) {
    for (let i=0;i< tasks.length;i++) {
      for (let j=0;j<tasks[i].labels.length;j++) {
        if (tasks[i].labels[j] == label) {
          display.createTask(tasks[i].description, false, tasks[i].priority);
          renderLabels();
        }
      }
    }
    return;
  }
 
  if (filter == 'priority') {
    for (let i=0; i<tasks.length;i++) {
      if (tasks[i].priority != undefined) {
        display.createTask(tasks[i].description, false, tasks[i].priority);
        renderLabels();
      }
    }
    return;
  }

  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].list == currentList) {
      display.createTask(tasks[i].description, false, tasks[i].priority);
      renderLabels();
    }
  }
}

const renderLabels = () => {
  display.clearLabels();
  let temp = [];
  for (let i = 0; i < tasks.length; i++) {
    for (let j = 0; j < tasks[i].labels.length; j++) {
      if (temp == '') {
        temp.push(tasks[i].labels[j]);
      } else {
        if (temp.find(element => element == tasks[i].labels[j])) continue;
        temp.push(tasks[i].labels[j]);
      }
    }
  }
  for (let l = 0; l < temp.length; l++) {
    display.createSidebarLabel(temp[l]);
  }
}

// Sort through our Task Array

const sortByPriority = order => {

  const returnValue = element => {
    switch (element) {
      case 'low':
        return 1;
      case 'med':
        return 2;
      case 'high':
        return 3;
      case 'undefined':
        return 0;
    }
  }

  if (order == 'ascending') {
    tasks = tasks.sort((lastOne, nextOne) => {
      if (returnValue(lastOne.priority) == undefined) {
        return 1;
      }
      return ((returnValue(lastOne.priority)) < (returnValue(nextOne.priority))) ? 1 : -1;
    });
    renderTasks();
  } else if (order == 'descending') {
    tasks = tasks.sort((lastOne, nextOne) => {
      if (returnValue(lastOne.priority) == undefined) {
        return 1;
      }
      return ((returnValue(lastOne.priority)) > (returnValue(nextOne.priority))) ? 1 : -1;
    });
    renderTasks();
  }
}

const sortByAlphabetical = order => {

  if (order == 'ascending') {
    tasks = tasks.sort((lastOne, nextOne) => {
      return (lastOne.description > nextOne.description) ? 1 : -1;
    });
    renderTasks();
  } else if (order == 'descending') {
    tasks = tasks.sort((lastOne, nextOne) => {
      return (lastOne.description < nextOne.description) ? 1 : -1;
    });
    renderTasks();
  }
}

const sortByDueDate = order => {

  if (order == 'ascending') {
    tasks = tasks.sort((lastOne, nextOne) => {
      if (lastOne.dueDate == undefined) return 1;
      return ( (new Date(lastOne.dueDate).getTime()) > (new Date(nextOne.dueDate).getTime()) ) ? 1 : -1;
    });
    renderTasks();
  } else if (order == 'descending') {
    tasks = tasks.sort((lastOne, nextOne) => {
      if (lastOne.dueDate == undefined) return 1;
      return ( (new Date(lastOne.dueDate).getTime()) < (new Date(nextOne.dueDate).getTime()) ) ? 1 : -1;
    });
    renderTasks();
  }
}



const sortByDefault = () => {
  tasks = tasks.sort((lastOne, nextOne) => {
    return lastOne.created > nextOne.created ? 1 : -1;
  });
  renderTasks();
}

// Filter through our task array


// Add and update task details

const updateTaskNotes = (task, notes) => {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].description == task && tasks[i].list == currentList) {
      tasks[i].notes = notes;
      break;
    }
  }
  window.localStorage.setItem('tasks', JSON.stringify(tasks));
}

const getTaskNotes = (task) => {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].description == task && tasks[i].list == currentList) {
      return tasks[i].notes;
    }
  }
}

const updateTaskPriority = (task, flag) => {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].description == task && tasks[i].list == currentList) {
      tasks[i].priority = flag;
      break;
    }
  }
  window.localStorage.setItem('tasks', JSON.stringify(tasks));
}

const getTaskPriority = (task) => {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].description == task && tasks[i].list == currentList) {
      return tasks[i].priority;
    }
  }
}

const updateTaskDueDate = (task, date) => {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].description == task && tasks[i].list == currentList) {
      tasks[i].dueDate = date;
      break;
    }
  }
  window.localStorage.setItem('tasks', JSON.stringify(tasks));
}

const getTaskDueDate = (task) => {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].description == task && tasks[i].list == currentList) {
      return tasks[i].dueDate;
    }
  }
}

const updateTaskLabels = (task, label) => {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].description == task && tasks[i].list == currentList) {
      tasks[i].labels.push(label);
      break;
    }
  }
  window.localStorage.setItem('tasks', JSON.stringify(tasks));
}

const getTaskLabels = (task) => {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].description == task && tasks[i].list == currentList) {
      return tasks[i].labels;
    }
  }
}

const getTaskListing = (task) => {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].description == task) {
      return tasks[i].list;
    }
  }
}

// Update list details

const updateLists = (list, value) => {
  for (let i = 0; i < lists.length; i++) {
    if (lists[i].description == list) {
      lists[i].description = value;
    }
  }
  renderLists();
  window.localStorage.setItem('lists', JSON.stringify(lists));
}


// Deletion

const deleteTask = task => {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].description == task && tasks[i].list == currentList) {
      tasks.splice(i, 1);
      break;
    }
  }
  window.localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();

}

const deleteList = list => {
  for (let i = 0; i < lists.length; i++) {
    if (lists[i].description == list) {
      lists.splice(i, 1);
      for (let j = 0; j < tasks.length; j++) {
        if (tasks[j].list == list) {
          tasks.splice(j, 1);
        }
      }
      break;
    }
  }
  window.localStorage.setItem('lists', JSON.stringify(lists));
  window.localStorage.setItem('tasks', JSON.stringify(tasks));
  display.activeList('Personal');
  renderLists();
  renderTasks();

}


// Storage and creation
const newTask = (task) => {
  tasks.push(Task(task, currentList, ...Array(3), Date.now()));
  window.localStorage.setItem('tasks', JSON.stringify(tasks));
}

const newList = (list) => {
  lists.push(List(list));
  window.localStorage.setItem('lists', JSON.stringify(lists));
}


let tasks;
let localTasks = window.localStorage.getItem('tasks');
if (localTasks == null) {
  tasks = [];
} else {
  tasks = JSON.parse(window.localStorage.getItem('tasks'));
  sortByDefault();
}


let lists;
let localLists = window.localStorage.getItem('lists');
if (localLists == null) {
  lists = [];
  newList('Personal');
  newList('Work');
  newList('Groceries');
} else {
  lists = JSON.parse(window.localStorage.getItem('lists'));
  renderLists();
}