# API Contract

The backend exposes a REST API at `http://localhost:3000/api`. Requests and responses use JSON.

## Response Format

| Field        | Type            | Present in                        | Description                          |
| :----------- | :-------------- | :-------------------------------- | :----------------------------------- |
| `status`     | String          | Every response                    | `success` or `error`                 |
| `message`    | String          | List, create, and error responses | Human-readable result                |
| `data`       | Object or Array | Success responses                 | Report resource or report collection |
| `pagination` | Object          | List response                     | Page metadata                        |
| `errors`     | Array           | Validation errors                 | Field-level messages                 |

## Endpoints

| Method | Path           | Purpose                          | Success status |
| :----- | :------------- | :------------------------------- | :------------- |
| `GET`  | `/reports`     | List, sort, and paginate reports | `200`          |
| `GET`  | `/reports/:id` | Retrieve one report              | `200`          |
| `POST` | `/reports`     | Submit a report                  | `201`          |

(PATCH and DELETE: TBD in Checkpoint 3.)

## List Reports

`GET /reports` returns reports with pagination metadata, sorted by `createdAt` newest first unless `sort=oldest` is set.

### Search and Filter Parameters

Search and filtering are optional. The core listing supports `sort` and `page` without search or filters.

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
      "id": "550e8400-e29b-41d4-a716-446655440008",
      "title": "AirPods Pro Charging Case",
      "description": "Found an empty charging case on the desk closest to the whiteboard. Kept at the front desk.",
      "type": "FOUND",
      "category": "ELECTRONICS",
      "location": "Classroom (A2.51)",
      "date": "2026-11-12T00:00:00.000Z",
      "imageUrl": "https://placehold.co/600x400?text=AirPods+Case",
      "reporterName": "Yoga Prasetyo",
      "contact": {
        "type": "LINE",
        "value": "yogaprasetyo"
      },
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
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Black Corkcicle Tumbler",
    "description": "Left it in Room A206 after SDA class. Has a RISTEK sticker on the bottom.",
    "type": "LOST",
    "category": "TUMBLER",
    "location": "Classroom (A2.06)",
    "date": "2026-11-15T00:00:00.000Z",
    "imageUrl": null,
    "reporterName": "Budi Santoso",
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
| `reporterName` | String | Yes      | Reporter display name                                               |
| `contactType`  | String | Yes      | `WHATSAPP`, `LINE`, `INSTAGRAM`, `DISCORD`, `EMAIL`                 |
| `contactValue` | String | Yes      | Phone number, account username, or email address                    |
| `imageUrl`     | String | No       | Image URL string supplied with the report                           |

### Image Upload

(Image upload: TBD in Checkpoint 3.)

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
    "id": "550e8400-e29b-41d4-a716-446655440009",
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
| `201` | Report created                                                     |
| `400` | Invalid query parameter, invalid field value, or failed validation |
| `404` | No report matches the requested `id`                               |
| `500` | Unhandled server error                                             |

(CORS configuration: TBD in Checkpoint 2.)
