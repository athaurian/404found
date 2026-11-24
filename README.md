# 404Found

404Found is a Lost & Found web application for Fasilkom UI students. Its goal is to connect students who lost an item with those who found it.

> A project for RISTEK Open Class 2026.

## Requirements Coverage

| Requirement                       | Status   | Behavior                                                                                                    |
| :-------------------------------- | :------- | :---------------------------------------------------------------------------------------------------------- |
| Public report listing and details | Required | `GET /reports` returns every report, and `GET /reports/:id` returns one.                                    |
| Search and filtering              | Required | Query parameters match item name, report type, category, location, and the date the item was lost or found. |
| Report submission                 | Required | `POST /reports` accepts a text report and an optional Cloudinary image URL. `POST /reports/upload` remains available for storing a new photo. |
| Image placeholders                | Required | The listing and detail pages show a default placeholder when a report has no photo.                         |
| Contact and name privacy          | Required | The API returns contact only on the detail response and never returns `reporterName` from public read endpoints. |

## Documentation

| Document                                                 | Contents                                                   |
| :------------------------------------------------------- | :--------------------------------------------------------- |
| [`docs/project-plan.md`](docs/project-plan.md)           | Team responsibilities, work split, and checkpoint schedule |
| [`docs/application-plan.md`](docs/application-plan.md)   | Pages, shared layout, and form behavior                    |
| [`docs/database-design.md`](docs/database-design.md)     | Report entity, enums, and API-to-Prisma mapping            |
| [`docs/api-contract.md`](docs/api-contract.md)           | Endpoints, query parameters, pagination, and image upload  |
| [`docs/mock-data.md`](docs/mock-data.md)                 | Mock dataset location and invariants                       |
| [`docs/development-setup.md`](docs/development-setup.md) | Prerequisites and environment variables                    |
| [`docs/contributors.md`](docs/contributors.md)           | GitHub commit attribution and team accounts                |

## Repository Layout

| Path         | Contents                          |
| :----------- | :-------------------------------- |
| `backend/`   | Express API and Prisma data layer |
| `frontend/`  | React and Vite application        |
| `docs/`      | Project documentation             |
| `mock-data/` | Shared report dataset             |

## Tech Stack

| Component       | Technology                                            |
| :-------------- | :---------------------------------------------------- |
| Frontend        | HTML, CSS, JavaScript, React.js, Vite                 |
| Backend         | JavaScript, Node.js, Express.js, Multer, CORS, Dotenv |
| Database        | PostgreSQL                                            |
| ORM             | Prisma ORM                                            |
| Image storage   | Cloudinary                                            |
| Version control | Git and GitHub                                        |

## Team

| Member                   | GitHub                                         | Track    |
| :----------------------- | :--------------------------------------------- | :------- |
| Hanif Ilham Athaurrahman | [@athaurian](https://github.com/athaurian)     | Backend  |
| Salva Faddil Rinaldi     | [@salvafaddil](https://github.com/salvafaddil) | Frontend |
| Ilham Ligar Samudra      | [@Ilham12359](https://github.com/Ilham12359)   | Frontend |

## Checkpoint Status

| Checkpoint                         | Deadline         | Status                 |
| :--------------------------------- | :--------------- | :--------------------- |
| 1. Project preparation             | 16 November 2026 | Documentation complete |
| 2. Main UI and working API         | 20 November 2026 | Complete               |
| 3. Full integration and deployment | 22 November 2026 | Not started            |

## Local Development

| Item                          | Detail                                                                          |
| :---------------------------- | :------------------------------------------------------------------------------ |
| Prerequisites and environment | [`docs/development-setup.md`](docs/development-setup.md)                        |
| API base URL                  | `http://localhost:3000/api`                                                     |
| Endpoints and response shapes | [`docs/api-contract.md`](docs/api-contract.md)                                  |
| Report storage                | PostgreSQL, seeded once from [`mock-data/reports.json`](mock-data/reports.json) |

## Public Deployment

### Frontend

| Item              | Value                                                                                   |
| :---------------- | :-------------------------------------------------------------------------------------- |
| Workflow          | [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)                          |
| Trigger           | Push to `main`, or manual `workflow_dispatch`                                           |
| Site              | `https://athaurian.github.io/404found/`                                                 |
| Build environment | `VITE_API_BASE_URL=https://optiplex.tail1e8f95.ts.net/api`<br>`VITE_USE_MOCK_API=false` |
| Router            | `HashRouter`: Pages cannot rewrite deep links to `index.html`                           |

### Backend

`docker compose up -d --build` builds [`backend/Dockerfile`](backend/Dockerfile) and serves the API on port `3100`. Tailscale Funnel publishes that port at the public URL below.

| Access  | Base URL                                 |
| :------ | :--------------------------------------- |
| Public  | `https://optiplex.tail1e8f95.ts.net/api` |
| Tailnet | `http://optiplex:3100/api`               |
| Local   | `http://localhost:3000/api`              |
