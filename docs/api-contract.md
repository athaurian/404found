# API Contract

The backend exposes a REST API. Requests and responses use JSON.

| Access  | Base URL                                 |
| :------ | :--------------------------------------- |
| Public  | `https://optiplex.tail1e8f95.ts.net/api` |
| Tailnet | `http://optiplex:3100/api`               |
| Local   | `http://localhost:3000/api`              |

## Response Format

| Field        | Type            | Present in                        | Description                          |
| :----------- | :-------------- | :-------------------------------- | :----------------------------------- |
| `status`     | String          | Every response                    | `success` or `error`                 |
| `message`    | String          | List, create, and error responses | Human-readable result                |
| `data`       | Object or Array | Success responses                 | Report resource or report collection |
| `pagination` | Object          | List response                     | Page metadata                        |
| `errors`     | Array           | Validation errors                 | Field-level messages                 |

## Endpoints

| Method | Path              | Purpose                          | Success status |
| :----- | :---------------- | :------------------------------- | :------------- |
| `GET`  | `/reports`        | List, sort, and paginate reports | `200`          |
| `GET`  | `/reports/:id`    | Retrieve one report              | `200`          |
| `POST` | `/reports`        | Submit a report                  | `201`          |
| `POST` | `/reports/upload` | Upload one report image          | `201`          |

(PATCH and DELETE: TBD in Checkpoint 3.)

## List Reports

`GET /reports` returns six reports per page with pagination metadata. It sorts by `createdAt` newest first. `sort=oldest` reverses the order.

### Search and Filter Parameters

Search and filtering narrow the listing. `sort` and `page` work without either.

| Parameter  | Description                                                       | Allowed values                                                      | Default   |
| :--------- | :---------------------------------------------------------------- | :------------------------------------------------------------------ | :-------- |
| `q`        | Case-insensitive partial match on `title`                         | Any text                                                            | No search |
| `type`     | Report type                                                       | `lost`, `found`                                                     | Both      |
| `category` | Item category                                                     | `ELECTRONICS`, `TUMBLER`, `ID_CARD`, `ACCESSORIES`, `MISCELLANEOUS` | All       |
| `location` | Location name, exact match                                        | A location from the shared list                                     | All       |
| `date`     | Date the item was lost or found, matched against the `date` field | `YYYY-MM-DD` or `dd/mm/yyyy`                                        | All       |
| `sort`     | Sort order by `createdAt`                                         | `newest`, `oldest`                                                  | `newest`  |
| `page`     | Page number                                                       | Integer of at least `1`                                             | `1`       |

- **Combined filters:** Active parameters combine with `AND`, so a report must match all active parameters.
- **Missing parameter:** No filter is applied.
- **No matches:** The response is `200` with an empty `data` array.

### Pagination Parameters

Each page holds six reports. The API does not accept a custom page size.

| Field         | Type    | Description                          |
| :------------ | :------ | :----------------------------------- |
| `currentPage` | Number  | Page number in the response          |
| `totalPages`  | Number  | Total page count                     |
| `totalItems`  | Number  | Total reports that match the filters |
| `perPage`     | Number  | Fixed value `6`                      |
| `hasNextPage` | Boolean | `true` when a later page exists      |
| `hasPrevPage` | Boolean | `true` when an earlier page exists   |

- **Valid value:** `page` is an integer of at least `1`.
- **Invalid value:** The response is `400 Bad Request`.
- **Out of range:** A `page` above `totalPages` clamps to the last page when `totalPages` is greater than `0`.

### Success Response

`200 OK` for `GET /reports?q=AirPods` against the [shared mock dataset](mock-data.md):

```json
{
  "status": "success",
  "message": "Reports retrieved successfully",
  "data": [
    {
      "id": "9c4b7e2a-1d63-4f08-9a5e-000000000008",
      "title": "AirPods Pro Charging Case",
      "description": "Found an empty charging case on the desk closest to the whiteboard. Kept at the front desk.",
      "type": "FOUND",
      "category": "ELECTRONICS",
      "location": "Classroom (A2.51)",
      "date": "2026-11-12T00:00:00.000Z",
      "imageUrl": "https://res.cloudinary.com/we26830c/image/upload/v1795421630/404found/mock/mock-07.webp",
      "createdAt": "2026-11-12T09:15:00.000Z",
      "updatedAt": "2026-11-12T09:15:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "perPage": 6,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

The listing omits `contact` and `reporterName`. `GET /reports/:id` returns the reporter's chosen contact method but omits `reporterName`.

### Invalid Page Response

`400 Bad Request`:

```json
{
  "status": "error",
  "message": "Invalid value, please input a number equal-to or greater-than 1"
}
```

## Retrieve a Report

`GET /reports/:id` returns one report. The `id` path parameter is the report UUID.

### Success Response

`200 OK`:

```json
{
  "status": "success",
  "data": {
    "id": "9c4b7e2a-1d63-4f08-9a5e-000000000002",
    "title": "Black Corkcicle Tumbler",
    "description": "Left on the table in Room A206 after the SDA class. Has a RISTEK sticker on the bottom.",
    "type": "LOST",
    "category": "TUMBLER",
    "location": "Classroom (A2.06)",
    "date": "2026-11-15T00:00:00.000Z",
    "imageUrl": "https://res.cloudinary.com/we26830c/image/upload/v1795421624/404found/mock/mock-02.webp",
    "contact": {
      "type": "LINE",
      "value": "budisantoso26"
    },
    "createdAt": "2026-11-15T08:30:00.000Z",
    "updatedAt": "2026-11-15T08:30:00.000Z"
  }
}
```

### Not Found Response

`404 Not Found`:

```json
{
  "status": "error",
  "message": "Report with the specified ID was not found."
}
```

## Submit a Report

`POST /reports` creates one report and returns the stored resource.

### Request Fields

| Field          | Type   | Required | Accepted values                                                     |
| :------------- | :----- | :------- | :------------------------------------------------------------------ |
| `title`        | String | Yes      | Item name                                                           |
| `description`  | String | Yes      | Item details                                                        |
| `type`         | String | Yes      | `LOST`, `FOUND`                                                     |
| `category`     | String | Yes      | `ELECTRONICS`, `TUMBLER`, `ID_CARD`, `ACCESSORIES`, `MISCELLANEOUS` |
| `location`     | String | Yes      | A location from the shared list                                     |
| `date`         | String | Yes      | `YYYY-MM-DD` or `dd/mm/yyyy`                                        |
| `reporterName` | String | Yes      | Private reporter name, stored but omitted from public read responses |
| `contactType`  | String | Yes      | `WHATSAPP`, `LINE`, `INSTAGRAM`, `DISCORD`, `EMAIL`                 |
| `contactValue` | String | Yes      | Phone number, account username, or email address                    |
| `imageUrl`     | String | No       | Cloudinary image URL (`https://res.cloudinary.com/...`)             |

### Field Limits

| Field          | Maximum length |
| :------------- | :------------- |
| `title`        | 120            |
| `description`  | 1000           |
| `reporterName` | 80             |
| `contactValue` | 120            |
| `imageUrl`     | 2048           |

### Image Upload

`POST /reports/upload` accepts one image as `multipart/form-data` and returns its Cloudinary URL. Send that URL as `imageUrl` when creating the report. The Submit Report form uploads the selected file through this endpoint first, then submits the returned URL with the report. Clients that already host an image can still send its Cloudinary URL directly in `imageUrl`.

| Field   | Type | Required | Description                           |
| :------ | :--- | :------- | :------------------------------------ |
| `image` | File | Yes      | JPG, PNG, or WebP image, at most 5 MB |

- Allowed types are `image/jpeg`, `image/png`, and `image/webp`
- The maximum size is 5 MB
- The rate limit is shared with `POST /reports`

Success response, `201 Created`:

```json
{
  "status": "success",
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/404found/photo.jpg"
  }
}
```

Error responses:

- `400` for a missing file, unsupported type, or file over 5 MB
- `429` when the rate limit is exceeded
- `502` when Cloudinary rejects the upload
- `503` when Cloudinary credentials are not configured

### Example Request

```json
{
  "title": "Charger Laptop Type-C 65W",
  "description": "Found plugged into the wall socket near the sofa in Sekre BEM.",
  "type": "FOUND",
  "category": "ELECTRONICS",
  "location": "Sekre BEM",
  "date": "2026-11-16",
  "reporterName": "Siti Rahmawati",
  "contactType": "WHATSAPP",
  "contactValue": "081234567890"
}
```

### Created Response

`201 Created`:

```json
{
  "status": "success",
  "message": "Report submitted successfully",
  "data": {
    "id": "9c4b7e2a-1d63-4f08-9a5e-000000000037",
    "title": "Charger Laptop Type-C 65W",
    "description": "Found plugged into the wall socket near the sofa in Sekre BEM.",
    "type": "FOUND",
    "category": "ELECTRONICS",
    "location": "Sekre BEM",
    "date": "2026-11-16T00:00:00.000Z",
    "imageUrl": null,
    "reporterName": "Siti Rahmawati",
    "contact": {
      "type": "WHATSAPP",
      "value": "081234567890"
    },
    "createdAt": "2026-11-16T10:15:00.000Z",
    "updatedAt": "2026-11-16T10:15:00.000Z"
  }
}
```

### Validation Error Response

`400 Bad Request`:

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    { "field": "title", "message": "Item name is required" },
    { "field": "contactValue", "message": "Contact value is required" }
  ]
}
```

## Status Codes

| Code  | Condition                                                          |
| :---- | :----------------------------------------------------------------- |
| `200` | Successful read                                                    |
| `201` | Report created or image uploaded                                   |
| `400` | Invalid query parameter, invalid field value, or failed validation |
| `404` | No report matches the requested `id`                               |
| `429` | More than 20 submissions or uploads from one client in a minute    |
| `500` | Unhandled server error                                             |
| `502` | Cloudinary upload failed                                           |
| `503` | Cloudinary credentials are not configured                          |

## CORS

`FRONTEND_URL` lists the origins that receive CORS headers, and it defaults to `http://localhost:5173`. Separate origins with commas. The public deployment adds `https://athaurian.github.io`.
