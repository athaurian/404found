import { getCloudinaryCloudName } from "../config/cloudinary.js";
import { getTodayDateString, parseReportDate } from "../config/date.js";
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

const MIN_LENGTHS = {
  title: 3,
  description: 20,
  reporterName: 3,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INSTAGRAM_PATTERN = /^@?[A-Za-z0-9._]{1,30}$/;
const HANDLE_PATTERN = /^\S{3,32}$/;
const NAME_PATTERN = /^\p{L}[\p{L}\p{M} .'-]*$/u;
const PHONE_PATTERN = /^(?:\+62|62|0)?8\d{7,12}$/;

/** Returns an error message for the contact value, or an empty string. */
function getContactError(contactType, value) {
  switch (contactType) {
    case "WHATSAPP": {
      const digits = value.replace(/[\s().-]/g, "");
      const digitCount = digits.replace(/\D/g, "").length;
      return PHONE_PATTERN.test(digits) &&
        digitCount >= 9 &&
        digitCount <= 15
        ? ""
        : "Enter an Indonesian WhatsApp number, for example 0812-3456-7890.";
    }
    case "LINE":
      return HANDLE_PATTERN.test(value)
        ? ""
        : "Enter a LINE ID with 3-32 characters and no spaces.";
    case "INSTAGRAM":
      return INSTAGRAM_PATTERN.test(value)
        ? ""
        : "Enter an Instagram username or @handle with up to 30 characters.";
    case "DISCORD":
      return HANDLE_PATTERN.test(value)
        ? ""
        : "Enter a Discord username with 3-32 characters and no spaces.";
    case "EMAIL":
      return EMAIL_PATTERN.test(value)
        ? ""
        : "Please enter a valid email address.";
    default:
      return "";
  }
}

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
  } else if (title.length < MIN_LENGTHS.title) {
    errors.push({
      field: "title",
      message: `Please enter at least ${MIN_LENGTHS.title} characters for the item name.`,
    });
  }
  if (!description) {
    errors.push({ field: "description", message: "Description is required" });
  } else if (description.length < MIN_LENGTHS.description) {
    errors.push({
      field: "description",
      message: `Please write at least ${MIN_LENGTHS.description} characters so others can identify the item.`,
    });
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
  } else if (date.slice(0, 10) > getTodayDateString()) {
    errors.push({
      field: "date",
      message: "Please pick a date that is not in the future.",
    });
  }
  if (!reporterName) {
    errors.push({ field: "reporterName", message: "Reporter name is required" });
  } else if (
    reporterName.length < MIN_LENGTHS.reporterName ||
    !NAME_PATTERN.test(reporterName)
  ) {
    errors.push({
      field: "reporterName",
      message:
        "Please use at least 3 characters with letters, spaces, periods, hyphens, or apostrophes.",
    });
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
  } else if (CONTACT_TYPES.includes(contactType)) {
    const contactError = getContactError(contactType, contactValue);
    if (contactError) {
      errors.push({ field: "contactValue", message: contactError });
    }
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
