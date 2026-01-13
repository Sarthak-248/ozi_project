# Task Manager — Ozi Project

A lightweight Kanban-style task manager with automatic task history tracking, basic authentication scaffolding, and a responsive React UI.

Overview
--------
This repository contains a full-stack task management application split into `backend/` and `frontend/` folders. The app supports:

- Creating, updating and deleting tasks
- Drag & drop Kanban board with pagination (2 tasks per page)
- Automatic task history tracking (creation, status changes, due date/title/description updates)
- Per-task history popover
- Basic user authentication scaffold (register/login)

Tech Stack
----------
- Backend: Node.js, Express, Mongoose (MongoDB)
- Frontend: React (Vite), Tailwind CSS, Framer Motion, dnd-kit
- API calls via `axios`

Repository Layout
-----------------
- `task-manager-ozi/backend` — Express API and Mongoose models
  - `src/modules/task` — task model, service, controller, routes
  - `src/modules/user` and `src/modules/auth` — user/auth logic
  - `src/config` — DB and env config
- `task-manager-ozi/frontend` — React app
  - `src/components` — UI components (`TaskCard`, `TaskHistoryModal`, ...)
  - `src/pages` — `KanbanBoard`, `Login`, `Register`, `Profile`
  - `src/api` — axios instance

Quick Start
-----------

1) Backend

```bash
cd task-manager-ozi/backend
npm install
# configure environment variables in src/config/env.js or create a .env
npm run dev
```

Important env variables (example)
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — JSON Web Token secret
- `PORT` — backend port (default often 5000)

2) Frontend

```bash
cd task-manager-ozi/frontend
npm install
npm run dev
```

Usage
-----
- Open the frontend dev server URL provided by Vite (usually `http://localhost:5173`).
- Register a user or log in using seeded/test credentials (if any).
- Create tasks in the Kanban board, drag between columns to change status (history entries are recorded), click the history 📜 button on a task to view changes, and delete tasks with the ✕ button.

Testing & Debugging
-------------------
- Backend contains test files (if present) in the `backend` folder root—run with `npm test` if configured.
- Use browser devtools (Console & Network) to inspect API calls and UI logs.

Notes
-----
- This README consolidates project documentation. Per-folder README files were removed to avoid duplication — if you want focused READMEs in `frontend/` or `backend/`, I can recreate them.
- Keep your MongoDB running and set `MONGO_URI` correctly before starting the backend.

License & Contact
-----------------
- This repo is for development purposes. Contact the maintainer for licensing and contribution details.
