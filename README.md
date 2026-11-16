# 404Found

404Found is a Lost & Found web application for Fasilkom UI students. Its goal is to connect students who lost an item with those who found it.

> A project for RISTEK Open Class 2026.

## Requirements Coverage

| Requirement                       | Status   | Planned behavior                                                                                            |
| :-------------------------------- | :------- | :---------------------------------------------------------------------------------------------------------- |
| Public report listing and details | Required | `GET /reports` returns every report, and `GET /reports/:id` returns one.                                    |
| Search and filtering              | Optional | Query parameters match item name, report type, category, location, and the date the item was lost or found. |
| Report submission                 | Required | `POST /reports` accepts a text report with an optional photo.                                               |

## Documentation

| Document                                                 | Contents                                                         |
| :------------------------------------------------------- | :--------------------------------------------------------------- |
| [`docs/project-plan.md`](docs/project-plan.md)           | Team responsibilities, work split, and checkpoint schedule       |
| [`docs/application-plan.md`](docs/application-plan.md)   | Pages, shared layout, and form behavior                          |
| [`docs/database-design.md`](docs/database-design.md)     | Report entity, enums, and API-to-Prisma mapping                  |
| [`docs/api-contract.md`](docs/api-contract.md)           | Endpoints, query parameters, pagination, and image upload format |
| [`docs/mock-data.md`](docs/mock-data.md)                 | Mock dataset location and invariants                             |
| [`docs/development-setup.md`](docs/development-setup.md) | Prerequisites and environment variables                          |

## Repository Layout

| Path         | Contents                              |
| :----------- | :------------------------------------ |
| `backend/`   | Express API scaffold for Checkpoint 2 |
| `docs/`      | Checkpoint 1 documentation            |
| `mock-data/` | Shared report dataset                 |

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
| 2. Main UI and working API         | 19 November 2026 | Not started            |
| 3. Full integration and deployment | 22 November 2026 | Not started            |

## Local Development

Prerequisites and environment variables are documented in [`docs/development-setup.md`](docs/development-setup.md).
