export const REPORT_LIMITS = {
  title: { min: 3, max: 120 },
  description: { min: 20, max: 1000 },
  contactValue: { max: 120 },
  reporterName: { min: 3, max: 80 },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INSTAGRAM_PATTERN = /^@?[A-Za-z0-9._]{1,30}$/;
const HANDLE_PATTERN = /^\S{3,32}$/;
const NAME_PATTERN = /^\p{L}[\p{L}\p{M} .'-]*$/u;
const PHONE_PATTERN = /^(?:\+62|62|0)?8\d{7,12}$/;

/** Today in the device's local timezone, as YYYY-MM-DD. */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Returns an error message for the contact value, or an empty string. */
export function getContactError(contactType, value) {
  const contact = value.trim();

  switch (contactType) {
    case "WHATSAPP": {
      const digits = contact.replace(/[\s().-]/g, "");
      const digitCount = digits.replace(/\D/g, "").length;
      return PHONE_PATTERN.test(digits) &&
        digitCount >= 9 &&
        digitCount <= 15
        ? ""
        : "Enter an Indonesian WhatsApp number, for example 0812-3456-7890.";
    }
    case "LINE":
      return HANDLE_PATTERN.test(contact)
        ? ""
        : "Enter a LINE ID with 3-32 characters and no spaces.";
    case "INSTAGRAM":
      return INSTAGRAM_PATTERN.test(contact)
        ? ""
        : "Enter an Instagram username or @handle with up to 30 characters.";
    case "DISCORD":
      return HANDLE_PATTERN.test(contact)
        ? ""
        : "Enter a Discord username with 3-32 characters and no spaces.";
    case "EMAIL":
      return EMAIL_PATTERN.test(contact)
        ? ""
        : "Please enter a valid email address.";
    default:
      return "";
  }
}

/** Validates the submit form and returns field errors keyed by field name. */
export function validateReport(form) {
  const errors = {};

  if (!form.type) errors.type = "Please choose Lost or Found.";

  const title = form.title.trim();
  if (!title) {
    errors.title = "Please enter the item name.";
  } else if (title.length < REPORT_LIMITS.title.min) {
    errors.title = `Please enter at least ${REPORT_LIMITS.title.min} characters for the item name.`;
  }

  if (!form.category) errors.category = "Please choose a category.";
  if (!form.location) {
    errors.location = "Please select where it was lost or found.";
  }

  if (!form.date) {
    errors.date = `Please pick the date it was ${
      form.type === "FOUND" ? "found" : "lost"
    }.`;
  } else if (form.date > getTodayDateString()) {
    errors.date = "Please pick a date that is not in the future.";
  }

  const description = form.description.trim();
  if (!description) {
    errors.description = "Please add a short description.";
  } else if (description.length < REPORT_LIMITS.description.min) {
    errors.description = `Please write at least ${REPORT_LIMITS.description.min} characters so others can identify the item.`;
  }

  const contact = form.contactValue.trim();
  if (!contact) {
    errors.contactValue = "Please enter how students can reach you.";
  } else {
    const contactError = getContactError(form.contactType, contact);
    if (contactError) errors.contactValue = contactError;
  }

  const reporterName = form.reporterName.trim();
  if (!reporterName) {
    errors.reporterName = "Please enter your name for the private record.";
  } else if (
    reporterName.length < REPORT_LIMITS.reporterName.min ||
    !NAME_PATTERN.test(reporterName)
  ) {
    errors.reporterName =
      "Please use at least 3 characters with letters, spaces, periods, hyphens, or apostrophes.";
  }

  return errors;
}
