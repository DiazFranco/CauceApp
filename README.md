# Cauce — Portfolio de Inversiones

Plataforma web para llevar un portfolio de inversiones consolidado en ARS y USD.
MVP con carga manual de activos, login con Google (Supabase Auth), tipo de cambio
automático vía DolarAPI y precios de cripto vía CoinGecko.

<img width="1285" height="926" alt="image" src="https://github.com/user-attachments/assets/7115884a-e86a-4532-9089-e82de25d9c93" />


## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind + TanStack Query + React Router
- **Backend:** Node + Express + TypeScript + Prisma
- **Auth/DB:** Supabase (Auth + PostgreSQL)
- **Datos:** DolarAPI (tipo de cambio), CoinGecko (cripto)

## Desarrollo

```bash
yarn install
yarn dev
```

Requiere `.env` en `backend/` (ver `backend/.env.example`).

## Deploy

### Backend — Render

1. Subí el repo a GitHub.
2. En Render: **New > Blueprint** y conectá el repo (usa `render.yaml`), **o** creá un *Web Service*:
   - Build: `corepack yarn install --immutable && corepack yarn workspace backend prisma generate && corepack yarn workspace backend build`
   - Start: `node backend/dist/index.js`
3. Configurá las env vars del servicio:
   - `DATABASE_URL` y `DIRECT_URL` (cadenas de Supabase, ver `backend/.env.example`)
   - `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_ORIGIN`: URL del frontend en Vercel
4. Las migraciones se aplican solas en el build (`prisma migrate deploy`).

### Frontend — Vercel

1. En Vercel importá el mismo repo (raíz del monorepo). Usa `vercel.json`: hace build de `frontend/` y sirve como SPA.
2. Configurá las env vars del proyecto:
   - `VITE_API_URL`: URL del backend en Render (ej: `https://cauce-api.onrender.com`)
   - `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
3. Vinculá `FRONTEND_ORIGIN` del backend con esta URL (`https://TU-FRONT.vercel.app`).

## Roadmap

Ver `RFC-001.md` para alcance del MVP, sprints y fases futuras.
