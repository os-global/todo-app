import { beforeEach, describe, expect, it, vi } from 'vitest';
import indexHtml from '../index.html?raw';

const STORAGE_KEY = 'spaceGrayTodos.v1';

let idCounter = 0;

function loadDomShell() {
  document.open();
  document.write(indexHtml);
  document.close();
}

async function bootApp() {
  vi.resetModules();
  await import('../app.js');
}

function addTodo(text) {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  input.value = text;
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

function todoTexts() {
  return [...document.querySelectorAll('.todo-item .todo-text')].map((el) => el.textContent);
}

beforeEach(() => {
  localStorage.clear();
  loadDomShell();

  idCounter = 0;
  vi.spyOn(globalThis.crypto, 'randomUUID').mockImplementation(() => `todo-${++idCounter}`);
  vi.spyOn(window, 'prompt').mockReturnValue(null);
});

describe('Space Gray Todo app', () => {
  it('adds a todo', async () => {
    await bootApp();

    addTodo('Ship tests');

    expect(todoTexts()).toEqual(['Ship tests']);
    expect(document.getElementById('todo-count').textContent).toBe('1 item left');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toHaveLength(1);
  });

  it('edits a todo', async () => {
    await bootApp();
    addTodo('Old task');

    window.prompt.mockReturnValueOnce('Updated task');
    document.querySelector('.edit-btn').click();

    expect(todoTexts()).toEqual(['Updated task']);
  });

  it('toggles complete and updates active count', async () => {
    await bootApp();
    addTodo('Toggle me');

    const checkbox = document.querySelector('.todo-toggle');
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));

    expect(document.querySelector('.todo-item').classList.contains('completed')).toBe(true);
    expect(document.getElementById('todo-count').textContent).toBe('0 items left');
  });

  it('deletes a todo', async () => {
    await bootApp();
    addTodo('Delete me');

    document.querySelector('.delete-btn').click();

    expect(todoTexts()).toEqual([]);
    expect(document.getElementById('todo-count').textContent).toBe('0 items left');
  });

  it('filters todos by all, active, and completed', async () => {
    await bootApp();
    addTodo('Active task');
    addTodo('Completed task');

    const firstCheckbox = document.querySelector('.todo-toggle');
    firstCheckbox.checked = true;
    firstCheckbox.dispatchEvent(new Event('change', { bubbles: true }));

    document.querySelector('[data-filter="active"]').click();
    expect(todoTexts()).toEqual(['Active task']);

    document.querySelector('[data-filter="completed"]').click();
    expect(todoTexts()).toEqual(['Completed task']);

    document.querySelector('[data-filter="all"]').click();
    expect(todoTexts()).toEqual(['Completed task', 'Active task']);
  });

  it('clears completed todos', async () => {
    await bootApp();
    addTodo('Keep me');
    addTodo('Remove me');

    const checkbox = document.querySelector('.todo-toggle');
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));

    document.getElementById('clear-completed').click();

    expect(todoTexts()).toEqual(['Keep me']);
    expect(document.getElementById('todo-count').textContent).toBe('1 item left');
  });

  it('loads todos from localStorage on startup', async () => {
    const stored = [
      { id: 'a', text: 'From storage (done)', completed: true, createdAt: 1 },
      { id: 'b', text: 'From storage (active)', completed: false, createdAt: 2 },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    await bootApp();

    expect(todoTexts()).toEqual(['From storage (done)', 'From storage (active)']);
    expect(document.querySelectorAll('.todo-item.completed')).toHaveLength(1);
    expect(document.getElementById('todo-count').textContent).toBe('1 item left');
  });
});
