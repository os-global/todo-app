# Todo App

A lightweight, responsive Todo List app built with plain HTML, CSS, and JavaScript.

## Features

- Add, edit, complete/uncomplete, and delete tasks
- Filter by **All**, **Active**, and **Completed**
- Clear all completed tasks in one click
- Persistent storage via `localStorage`
- Keyboard-friendly interactions (focus states, Enter/Space to edit)
- Mobile-first responsive design with a desktop max width of 700px

## Theme

Space-gray dark palette:

- Background: `#121212`
- Surface: `#2a2a2a`
- Primary text: `#e0e0e0`
- Secondary text: `#a0a0a0`
- Accent: `#00cfcf`

## Run locally

Just open `index.html` in a browser.

## Tests

This project uses **Vitest + jsdom** for DOM-based unit/integration tests.

```bash
npm install
npm test
```

Watch mode:

```bash
npm run test:watch
```

Test coverage includes:

- add todo
- edit todo
- toggle completed
- delete todo
- filters (All / Active / Completed)
- clear completed
- localStorage persistence on startup

## Deploy (GitHub Pages)

This repository is configured for GitHub Pages from:

- Branch: `main`
- Folder: `/ (root)`
