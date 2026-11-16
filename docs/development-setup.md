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

(npm scripts and frontend setup: TBD in Checkpoint 2.)

## Environment Variables

| Variable                | Default                 | Used by                             |
| :---------------------- | :---------------------- | :---------------------------------- |
| `PORT`                  | `3000`                  | Express server                      |
| `FRONTEND_URL`          | `http://localhost:5173` | CORS origin                         |
| `DATABASE_URL`          | None                    | Prisma PostgreSQL connection string |
| `CLOUDINARY_CLOUD_NAME` | None                    | Cloudinary SDK                      |
| `CLOUDINARY_API_KEY`    | None                    | Cloudinary SDK                      |
| `CLOUDINARY_API_SECRET` | None                    | Cloudinary SDK                      |

(Database and Cloudinary configuration: TBD in Checkpoint 3.)
