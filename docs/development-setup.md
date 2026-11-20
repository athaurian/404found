# Development Setup

## Prerequisites

| Tool               | Version              |
| :----------------- | :------------------- |
| Node.js            | 18 or newer          |
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

The Vite server runs on `http://localhost:5173`. It reads `frontend/.env`, which defaults to mock data. Copy `frontend/.env.example` before changing values.

## Docker

```bash
docker compose up -d --build
docker compose down
```

| Setting        | Value                          |
| :------------- | :----------------------------- |
| Host port      | `3100`                         |
| Container port | `3000`                         |
| Dataset        | `mock-data/` mounted read-only |

## Environment Variables

| Variable                | Default                 | Used by                             |
| :---------------------- | :---------------------- | :---------------------------------- |
| `PORT`                  | `3000`                  | Express server                      |
| `FRONTEND_URL`          | `http://localhost:5173` | CORS origin list                    |
| `DATABASE_URL`          | None                    | Prisma PostgreSQL connection string |
| `CLOUDINARY_CLOUD_NAME` | None                    | Cloudinary SDK                      |
| `CLOUDINARY_API_KEY`    | None                    | Cloudinary SDK                      |
| `CLOUDINARY_API_SECRET` | None                    | Cloudinary SDK                      |

(Database and Cloudinary configuration: TBD in Checkpoint 3.)
