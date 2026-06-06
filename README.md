# DevBoard

> A full-stack team collaboration platform — Jira-lite meets Notion.
> Built to demonstrate production-grade fullstack engineering.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com)

## Live Demo

| | |
|---|---|
| **Live Site** | https://devboard-web-sigma.vercel.app |
| **API Docs** | https://devboards-api.onrender.com/api/docs |
| **Demo Email** | `demo@devboard.app` |
| **Demo Password** | `Demo@1234` |

> First load may take ~30s — Render free tier spins down after inactivity.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router + TypeScript |
| Styling | Tailwind CSS |
| State | Zustand (client) + TanStack React Query (server) |
| Realtime | Socket.io client |
| Drag & Drop | @hello-pangea/dnd |
| Deploy | Vercel |

## Features

- **Kanban board** — drag and drop tasks across status columns with real-time sync
- **Real-time updates** — task changes from any user appear instantly via WebSocket
- **Command palette** — ⌘K search across projects and tasks
- **Notifications** — live bell icon with activity feed powered by WebSocket events
- **Activity feed** — paginated org-wide audit log with category filters
- **Members management** — invite, role management, remove with privilege rules enforced
- **Dark mode** — full light/dark theme support
- **JWT auth** — silent refresh on reload, automatic token rotation

## Screenshots

> Dashboard overview with stat cards, project list, member panel, and activity feed.

> Kanban board with drag-and-drop across To Do / In Progress / In Review / Done columns.

> Command palette (⌘K) searching tasks and projects from local cache.

## Local Setup

```bash
# Clone the repo
git clone https://github.com/DevBoardsVerse/devboard-web.git
cd devboard-web

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:3000

# Start dev server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

> Make sure the backend is running locally first —
> see [devboards-api](https://github.com/DevBoardsVerse/devboards-api)

## Project Structure

| Path | Description |
|---|---|
| `app/(marketing)/` | Landing page |
| `app/(dashboard)/page.tsx` | Overview dashboard |
| `app/(dashboard)/board/` | Kanban board |
| `app/(dashboard)/activity/` | Activity feed |
| `app/(dashboard)/members/` | Members management |
| `app/login/` | Login page |
| `app/register/` | Register page |
| `components/layout/` | Header, Sidebar, CommandPalette, NotificationBell |
| `components/modals/` | Create/edit modals for tasks, projects, orgs |
| `components/ui/` | Shared UI primitives |
| `hooks/` | useSocket, useTaskEvents |
| `lib/` | api.ts, queries.ts, socket.ts |
| `store/` | Zustand — auth.ts, app.ts |

--

Built by [Swapnil Jadhav](https://github.com/DevBoardsVerse)
