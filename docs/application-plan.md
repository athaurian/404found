# Application Plan

## Pages

| Page              | Description                                                                   |
| :---------------- | :---------------------------------------------------------------------------- |
| View Report       | Grid of all Lost and Found reports with search, filters, sort, and pagination |
| Report Details    | Full information for one report                                               |
| Submit Report     | Form for a new Lost or Found report                                           |
| About             | Site and team information                                                     |
| Sign-in (stretch) | Universitas Indonesia SSO account sign-in                                     |

## Shared Layout

Every page uses the same header:

- Site name and logo
- Links to View Report, Submit Report, and About
- Username and sign-in controls (stretch)

## View Report

The homepage shows reports in a grid. Each card has a short summary and a link to the full report.

Search and filters cover:

- Item name
- Type
- Category
- Location
- The date the item was lost or found

A Reset button clears every search and filter.

The page also shows:

- A result count, for example "12 reports found"
- A Newest or Oldest sort control
- "No reports match your search." when nothing matches

## Report Details

The page shows:

- A photo, when the report has one
- The item name
- The date posted and the date last edited
- Type and category
- Location and the date the item was lost or found
- Description and contact
- Edit and Delete controls for the original poster (TBD in Checkpoint 3)

## Submit Report

The form collects the fields listed in the [API contract](api-contract.md). Fields marked with an asterisk are required.

| Field                | Control                                        |
| :------------------- | :--------------------------------------------- |
| Item name\*          | Text input                                     |
| Type\*               | Lost or Found                                  |
| Category\*           | Dropdown                                       |
| Location\*           | Dropdown                                       |
| Date lost or found\* | Date picker (`dd/mm/yyyy`)                     |
| Description\*        | Text area for colour, brand, and other details |
| Photo                | JPG, PNG, or WebP under 5 MB                   |
| Contact\*            | Method dropdown and value input                |

The form shows a validation message when a required field is empty. It ends with Submit and Cancel buttons.

## About

Each contributor card shows a profile photo, name, and role. The card also links to the contributor's LinkedIn and GitHub profiles.

## Sign-in (Stretch)

- Set a username
- Verify with SSO UI

## Pagination

Each page shows six reports.

- Previous, Next, and page number controls
- Previous is disabled on the first page, and Next on the last.
- Moving to another page keeps the current search and filters.
- Changing a search term or filter resets the page to 1.
- An invalid page shows "Invalid value, please input a number equal-to or greater-than 1".
- A page past the end shows the last page.
