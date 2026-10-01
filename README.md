<div align="center">

# Shymkent Hub · Battle of Problems

**A civic platform where residents rank city problems head-to-head, Elo-style, so the city knows what to fix first.**

[**Live demo →**](https://shymhub.vercel.app/)

![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646cff?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ed?logo=docker&logoColor=white)

</div>

---

## Idea

A city gets far more complaints than it can handle at once. Instead of a flat list that nobody reads, Shymkent Hub shows residents **two problems side by side** and asks which one is more urgent. Each vote updates an **Elo rating**, the same system used to rank chess players, so a reliable priority list emerges from many quick comparisons.

## Features

- **Arena:** head-to-head voting. The K-factor drops from 40 to 20 after 10 matches, so ratings settle over time.
- **City map:** every problem pinned on an interactive Leaflet map.
- **Inspector dashboard:** city staff move problems through statuses and close them with before/after photos.
- **Resolved showcase:** a before/after slider for fixed issues.
- **Leaderboard and stats:** top problems and the most active residents.
- **Auth:** registration and login with JWT; passwords hashed with bcrypt.
- **Settings:** light/dark theme, KZ / RU / EN, sound effects, and CSV/JSON export.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Leaflet, Lucide |
| Backend | FastAPI, Pydantic, python-jose (JWT), bcrypt |
| Infra | Docker Compose, Vercel (frontend) |

## Getting started

```bash
cp .env.example .env      # set SECRET_KEY to a long random string
docker compose up -d --build
```

- Frontend: http://localhost:5173
- API: http://localhost:8000/api/health · Swagger: http://localhost:8000/docs

To run the frontend only (it falls back to local storage):

```bash
npm install
npm run dev
```

## API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create an account and get a JWT |
| `POST` | `/api/auth/login` | Log in and get a JWT |
| `GET` | `/api/auth/me` | Current user |
| `GET` / `POST` | `/api/problems` | List problems / report a problem |
| `PATCH` | `/api/problems/{id}/status` | Change status (inspector) |
| `PATCH` | `/api/problems/{id}/resolve` | Mark as resolved with an "after" photo |
| `POST` | `/api/vote` | Record a head-to-head vote |

## Roadmap

- [ ] Move from in-memory storage to PostgreSQL. The demo backend runs on a free tier and loses its data when the server goes to sleep.
- [ ] Image uploads to object storage
- [ ] Moderation queue for new reports
