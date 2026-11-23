# Mock Data

The dataset is in [`mock-data/reports.json`](../mock-data/reports.json), with an identical copy at [`frontend/src/data/reports.json`](../frontend/src/data/reports.json) for local mock API mode.

## Dataset

| Attribute       | Coverage                                                              |
| :-------------- | :-------------------------------------------------------------------- |
| Reports         | 36                                                                    |
| Types           | `LOST` and `FOUND`                                                    |
| Categories      | `ELECTRONICS`, `TUMBLER`, `ID_CARD`, `ACCESSORIES`, `MISCELLANEOUS`   |
| Locations       | All 9 shared locations                                                |
| Contact methods | `WHATSAPP`, `LINE`, `INSTAGRAM`, `DISCORD`, `EMAIL`                   |
| Images          | 28 reports have a Cloudinary image                                    |
| Placeholders    | 8 reports use `imageUrl: null` to exercise the placeholder treatment  |

## Images

All report images are stored in the `404found/mock` folder of the app's Cloudinary account. The images show objects only, with no identifiable people. Each image is encoded as WebP at quality 70 to keep previews small.

## Seeding

`backend/prisma/seed.js` reads `mock-data/reports.json` and inserts any missing rows into PostgreSQL. The container entrypoint runs the seed on every start, so new records are added without deleting existing reports.

## Editing

Keep both copies identical after editing. The seed uses `skipDuplicates`, so changing an existing record in the JSON file does not update the stored row. Reset the table before reseeding when record contents change.
