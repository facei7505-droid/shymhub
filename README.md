# shymhub

Сервер задеплоен в сайте https://shymhub.vercel.app/  Однако, бэкенд каждый раз падает из за бесплатного хостинга, когда нету запросов

Battle of Problems — civic issue prioritization platform for Shymkent.

## Stack
- Frontend: React + TypeScript + Vite
- Backend: FastAPI + JWT auth
- Deployment: Docker Compose / Vercel-ready frontend

## Quick start
```bash
cp .env.example .env
npm install
npm run dev
```

## Docker
```bash
docker compose up -d --build
```

Frontend: http://localhost:5173
Backend: http://localhost:8000/api/health
