import { getCloudinaryCloudName } from "../config/cloudinary.js";
import { parseReportDate } from "../config/date.js";
import {
  CATEGORIES,
  CONTACT_TYPES,
  LOCATIONS,
  REPORT_TYPES,
} from "../config/constants.js";
import { HttpError } from "./errorHandler.js";

const MAX_LENGTHS = {
  title: 120,
  description: 1000,
  reporterName: 80,
  contactValue: 120,
  imageUrl: 2048,
};

const FIELD_LABELS = {
  title: "Item name",
  description: "Description",
  reporterName: "Reporter name",
  contactValue: "Contact value",
  imageUrl: "Image URL",
};

function readString(body, field) {
  return typeof body[field] === "string" ? body[field].trim() : "";
}

/** Validates the POST body and stores the normalized values on the request. */
export function validateReport(req, res, next) {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const errors = [];

  const title = readString(body, "title");
  const description = readString(body, "description");
  const reporterName = readString(body, "reporterName");
  const contactValue = readString(body, "contactValue");

  const type = readString(body, "type").toUpperCase();
  const category = readString(body, "category").toUpperCase();
  const location = readString(body, "location");
  const contactType = readString(body, "contactType").toUpperCase();
  const date = parseReportDate(body.date);

  if (!title) {
    errors.push({ field: "title", message: "Item name is required" });
  }
  if (!description) {
    errors.push({ field: "description", message: "Description is required" });
  }
  if (!type) {
    errors.push({ field: "type", message: "Type is required" });
  } else if (!REPORT_TYPES.includes(type)) {
    errors.push({ field: "type", message: "Type must be LOST or FOUND" });
  }
  if (!category) {
    errors.push({ field: "category", message: "Category is required" });
  } else if (!CATEGORIES.includes(category)) {
    errors.push({
      field: "category",
      message: `Category must be one of: ${CATEGORIES.join(", ")}`,
    });
  }
  if (!location) {
    errors.push({ field: "location", message: "Location is required" });
  } else if (!LOCATIONS.includes(location)) {
    errors.push({
      field: "location",
      message: "Location must be one of the shared locations",
    });
  }
  if (!body.date) {
    errors.push({ field: "date", message: "Date is required" });
  } else if (!date) {
    errors.push({
      field: "date",
      message: "Date must use YYYY-MM-DD or dd/mm/yyyy",
    });
  }
  if (!reporterName) {
    errors.push({ field: "reporterName", message: "Reporter name is required" });
  }
  if (!contactType) {
    errors.push({ field: "contactType", message: "Contact type is required" });
  } else if (!CONTACT_TYPES.includes(contactType)) {
    errors.push({
      field: "contactType",
      message: `Contact type must be one of: ${CONTACT_TYPES.join(", ")}`,
    });
  }
  if (!contactValue) {
    errors.push({ field: "contactValue", message: "Contact value is required" });
  }

  const imageUrl =
    body.imageUrl === undefined || body.imageUrl === null
      ? null
      : typeof body.imageUrl === "string"
        ? body.imageUrl.trim() || null
        : undefined;

  if (imageUrl === undefined) {
    errors.push({ field: "imageUrl", message: "Image URL must be a string" });
  }

  if (typeof imageUrl === "string" && imageUrl.length > 0) {
    const cloudName = getCloudinaryCloudName();
    if (!cloudName) {
      errors.push({
        field: "imageUrl",
        message: "Image upload is not configured",
      });
    } else if (
      !imageUrl.startsWith(`https://res.cloudinary.com/${cloudName}/`)
    ) {
      errors.push({
        field: "imageUrl",
        message: "Image URL must come from the Cloudinary upload endpoint",
      });
    }
  }

  for (const [field, max] of Object.entries(MAX_LENGTHS)) {
    const value = field === "imageUrl" ? imageUrl : body[field];
    if (typeof value === "string" && value.length > max) {
      errors.push({
        field,
        message: `${FIELD_LABELS[field]} must be ${max} characters or fewer`,
      });
    }
  }

  if (errors.length > 0) {
    next(new HttpError(400, "Validation failed", errors));
    return;
  }

  req.validatedReport = {
    title,
    description,
    type,
    category,
    location,
    date,
    imageUrl,
    reporterName,
    contactType,
    contactValue,
  };
  next();
}
