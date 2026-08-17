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

## Roadmap

Ver `RFC-001.md` para alcance del MVP, sprints y fases futuras.
