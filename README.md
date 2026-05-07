# Boulder Buddy

A bouldering gym companion: a web platform for routesetters and admins to manage problems, plus a mobile app for climbers to browse boulders, watch demo videos, and log their progress.

This repository contains both projects in one place:

- **`web/`** — the Next.js webapp (gym admins, routesetters and gym staff)
- **`mobile/`** — the Expo / React Native mobile app (climbers)

Both share the same Postgres database via the web's API.

## What it does

- **Klimmers / Users** — bekijk de volledige boulder-zaal, walls en sectoren, met foto's en demo-videos van elke route. Log je pogingen en sla favorieten op.
- **Routesetters** — voeg nieuwe boulders toe, plaats ze op een wall met grade en color, upload foto/video van de move-beta.
- **Admins** — beheer gyms, walls, sectors, gebruikersrollen en alle CRUD over de database.
- **Auth** — JWT met HTTP-only cookies (web) en SecureStore (mobile), RS256 signing.

## Stack

| | Web (`web/`) | Mobile (`mobile/`) |
|---|---|---|
| Framework | Next.js 15 (App Router) | Expo 54 + Expo Router |
| Language | TypeScript | TypeScript |
| UI | Tailwind + shadcn/ui | React Native + custom components |
| State | Server Components + react-hook-form | TanStack Query |
| Auth | JWT (RS256) in HTTP-only cookie | JWT in `expo-secure-store` |
| Data | Prisma + Postgres | REST → web API |
| Validation | Zod (client + server) | — |

## Quick start

### Web

```bash
cd web
pnpm install
cp .env.example .env   # fill in DATABASE_URL, PRIVATE_KEY, PUBLIC_KEY
docker compose up -d   # starts Postgres
pnpm prisma migrate dev
pnpm prisma:seed
pnpm dev
```

### Mobile

```bash
cd mobile
pnpm install
echo "EXPO_PUBLIC_API_BASE_URL=http://<your-ip>:3000" > .env
pnpm start
```

Use the Expo Go app on your phone (or an emulator) to load the build. Make sure your phone and the machine running the web API are on the same network.

## Test accounts (seeded by `pnpm prisma:seed`)

| Role | Email | Password |
|---|---|---|
| User | user@test.com | `Password123!` |
| Setter | setter@test.com | `Password123!` |
| Admin | admin@test.com | `Password123!` |
| SuperAdmin | superadmin@test.com | `Password123!` |

## Repository layout

```
.
├── web/            Next.js webapp + Prisma schema + API routes
├── mobile/         Expo mobile app (talks to web/api)
└── README.md
```

Each subfolder has its own README with more details about that project.

## License

This project was built as part of a coursework assignment at IT-graduaten (academiejaar 2025–2026). The original AI-prototyped UI was generated with [v0.dev](https://v0.app/chat/bouldering-gym-webapp-i7b6gtRuurb?ref=H4G2H6) and rebuilt as a full-stack application.
