(() => {
  const STORAGE_KEY = 'spaceGrayTodos.v1';

  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const count = document.getElementById('todo-count');
  const filterButtons = [...document.querySelectorAll('.filter-btn')];
  const clearCompletedButton = document.getElementById('clear-completed');
  const itemTemplate = document.getElementById('todo-item-template');

  let todos = loadTodos();
  let currentFilter = 'all';

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function loadTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function addTodo(text) {
    todos.unshift({
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
    });
    saveTodos();
    render();
  }

  function updateCount() {
    const activeCount = todos.filter((todo) => !todo.completed).length;
    const noun = activeCount === 1 ? 'item' : 'items';
    count.textContent = `${activeCount} ${noun} left`;
  }

  function getVisibleTodos() {
    if (currentFilter === 'active') return todos.filter((todo) => !todo.completed);
    if (currentFilter === 'completed') return todos.filter((todo) => todo.completed);
    return todos;
  }

  function setFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach((button) => {
      const selected = button.dataset.filter === filter;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-selected', String(selected));
    });
    render();
  }

  function removeTodo(id) {
    todos = todos.filter((todo) => todo.id !== id);
    saveTodos();
    render();
  }

  function toggleTodo(id) {
    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    render();
  }

  function editTodo(id) {
    const todo = todos.find((item) => item.id === id);
    if (!todo) return;

    const nextText = window.prompt('Edit your task:', todo.text);
    if (nextText === null) return;

    const cleaned = nextText.trim();
    if (!cleaned) {
      removeTodo(id);
      return;
    }

    todos = todos.map((item) => (item.id === id ? { ...item, text: cleaned } : item));
    saveTodos();
    render();
  }

  function clearCompleted() {
    todos = todos.filter((todo) => !todo.completed);
    saveTodos();
    render();
  }

  function render() {
    list.innerHTML = '';

    const visibleTodos = getVisibleTodos();

    for (const todo of visibleTodos) {
      const fragment = itemTemplate.content.cloneNode(true);
      const item = fragment.querySelector('.todo-item');
      const toggle = fragment.querySelector('.todo-toggle');
      const text = fragment.querySelector('.todo-text');
      const editButton = fragment.querySelector('.edit-btn');
      const deleteButton = fragment.querySelector('.delete-btn');

      item.dataset.id = todo.id;
      item.classList.toggle('completed', todo.completed);
      toggle.checked = todo.completed;
      toggle.setAttribute('aria-label', `Mark ${todo.text} as ${todo.completed ? 'active' : 'completed'}`);
      text.textContent = todo.text;
      text.title = 'Double-click or press Enter to edit';

      toggle.addEventListener('change', () => toggleTodo(todo.id));
      editButton.addEventListener('click', () => editTodo(todo.id));
      deleteButton.addEventListener('click', () => removeTodo(todo.id));
      text.addEventListener('dblclick', () => editTodo(todo.id));
      text.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          editTodo(todo.id);
        }
      });

      list.appendChild(fragment);
    }

    updateCount();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addTodo(text);
    form.reset();
    input.focus();
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => setFilter(button.dataset.filter));
  });

  clearCompletedButton.addEventListener('click', clearCompleted);

  render();
})();
