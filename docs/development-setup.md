# Development Setup

## Prerequisites

| Tool               | Version              |
| :----------------- | :------------------- |
| Node.js            | 20.19 or newer       |
| npm                | Bundled with Node.js |
| PostgreSQL         | 14 or newer          |
| Cloudinary account | Free plan            |

## Backend Structure

```text
backend/
├── prisma/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── data/
│   ├── middlewares/
│   └── routes/
└── .env.example
```

## Backend Commands

```bash
cd backend
npm install
npm run dev
```

`npm run dev` restarts the server on file changes. `npm start` runs it once. Both load `.env` through `dotenv`.

## Frontend Commands

```bash
cd frontend
npm install
npm run dev
```

The Vite server runs on `http://localhost:5173`. Without `frontend/.env`, the frontend uses the live API at `https://optiplex.tail1e8f95.ts.net/api`, so local submissions reach the shared report store. Copy `frontend/.env.example` and keep `VITE_USE_MOCK_API=true` for local mock data.

## Docker

```bash
docker compose up -d --build
docker compose down
```

| Setting        | Value                                  |
| :------------- | :------------------------------------- |
| Host port      | `3100`                                 |
| Container port | `3000`                                 |
| Database       | `postgres:16-alpine`, volume `db-data` |
| Dataset        | `mock-data/` mounted read-only         |

- Root `.env` file with `POSTGRES_PASSWORD` and Cloudinary credentials
- `DATABASE_URL` assembled by Compose for the API container
- Port `3100` published by Tailscale Funnel at `https://optiplex.tail1e8f95.ts.net`

## Environment Variables

| Variable                | Default                                             | Used by                             |
| :---------------------- | :-------------------------------------------------- | :---------------------------------- |
| `PORT`                  | `3000`                                              | Express server                      |
| `FRONTEND_URL`          | `http://localhost:5173,https://athaurian.github.io` | CORS origin list                    |
| `POSTGRES_PASSWORD`     | `404found`                                          | Compose database credentials        |
| `DATABASE_URL`          | None                                                | Prisma PostgreSQL connection string |
| `CLOUDINARY_URL`        | None                                                | Cloudinary SDK, takes precedence    |
| `CLOUDINARY_CLOUD_NAME` | None                                                | Cloudinary SDK fallback             |
| `CLOUDINARY_API_KEY`    | None                                                | Cloudinary SDK fallback             |
| `CLOUDINARY_API_SECRET` | None                                                | Cloudinary SDK fallback             |

- `prisma migrate deploy` and `prisma db seed` before the server starts
- `skipDuplicates` during seed, so restarts keep existing reports
- `POST /reports/upload` returns `503` when Cloudinary credentials are absent
