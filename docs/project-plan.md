# Project Plan

This page records the team structure, work split, and checkpoint schedule for 404Found. The [database design](database-design.md) and [API contract](api-contract.md) pages describe the technical design.

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
| Listing and details | `GET /reports` and `GET /reports/:id`         | Report grid, filters, and detail page           |
| Submission          | `POST /reports`, validation, image handling   | Submission form, loading and error states       |
| Persistence         | Prisma schema, migrations, Cloudinary storage | Photo display for reports                       |
| Deployment          | API hosting and CORS for the frontend origin  | Frontend hosting and API base URL configuration |

## Frontend Split

| Member               | Checkpoint 2 work                                                                                   |
| :------------------- | :-------------------------------------------------------------------------------------------------- |
| Salva Faddil Rinaldi | Shared header, the View Report page with its grid and pagination, and the Report Details page.      |
| Ilham Ligar Samudra  | Search and filter controls inside the View Report page, the Submit Report form, and the About page. |

## Wireframes

The wireframes are in the [404 Found Figma file](https://www.figma.com/design/zJtyxERzIECVuc2AT1XaKy/404-Found---Lost---Found-Wireframes).

## Checkpoint Schedule

| Checkpoint                         | Deadline         | Status      |
| :--------------------------------- | :--------------- | :---------- |
| 1. Project preparation             | 16 November 2026 | Complete    |
| 2. Main UI and working API         | 20 November 2026 | Complete    |
| 3. Full integration and deployment | 22 November 2026 | Complete    |

(Checkpoint 2 and 3 deliverables follow the assignment brief.)

## Stretch Scope

The MVP stores `reporterName` privately on each report and requires no account. Public read responses omit it. Two features stay outside the MVP:

- **SSO UI sign-in:** Universitas Indonesia single sign-on. The sign-in page and the `User` to `Report` relationship depend on SSO support.
- **Report editing and deletion:** `PATCH /reports/:id` and `DELETE /reports/:id` require verified ownership of the report.
