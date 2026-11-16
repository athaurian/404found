# Project Plan

This page records the team structure, work split, and checkpoint schedule for 404Found. The technical design is documented in the [database design](database-design.md) and [API contract](api-contract.md) pages.

## Team and Responsibilities

| Member                   | Track    | Responsibilities                                                            |
| :----------------------- | :------- | :-------------------------------------------------------------------------- |
| Hanif Ilham Athaurrahman | Backend  | Designs the database schema, builds the REST API, and deploys the backend.  |
| Salva Faddil Rinaldi     | Frontend | Designs the user interface, user experience, essential pages, and features. |
| Ilham Ligar Samudra      | Frontend | Designs the user interface, user experience, essential pages, and features. |

## Work Split

| Area                | Backend                                       | Frontend                                        |
| :------------------ | :-------------------------------------------- | :---------------------------------------------- |
| Documentation       | Database design, API contract, mock data      | Page layouts and interaction design             |
| Listing and details | `GET /reports` and `GET /reports/:id`         | Report grid, optional filters, and detail page  |
| Submission          | `POST /reports`, validation, image handling   | Submission form, loading and error states       |
| Persistence         | Prisma schema, migrations, Cloudinary storage | Photo display for reports                       |
| Deployment          | API hosting and CORS for the frontend origin  | Frontend hosting and API base URL configuration |

## Checkpoint Schedule

| Checkpoint                         | Deadline         | Status      |
| :--------------------------------- | :--------------- | :---------- |
| 1. Project preparation             | 16 November 2026 | Complete    |
| 2. Main UI and working API         | 19 November 2026 | Not started |
| 3. Full integration and deployment | 22 November 2026 | Not started |

(Checkpoint 2 and 3 deliverables follow the assignment brief.)

## Optional Scope

Search and filtering are optional and follow the required endpoints. Image placeholders and contact privacy are out of scope. The required report endpoints and pagination take priority.

## Stretch Scope

The MVP stores `reporterName` on each report and requires no account. Two features stay outside the MVP:

- **SSO UI sign-in:** Universitas Indonesia single sign-on. The sign-in page and the `User` to `Report` relationship depend on SSO support.
- **Report editing and deletion:** `PATCH /reports/:id` and `DELETE /reports/:id` require verified ownership of the report.
