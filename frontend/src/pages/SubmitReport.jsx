import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageBand from "../components/PageBand";
import { CheckCircleIcon, EditNoteIcon } from "../components/Icons";
import {
  CATEGORIES,
  CONTACT_TYPES,
  LOCATIONS,
} from "../constants/reportOptions";
import { createReport } from "../services/reportsApi";
import "./SubmitReport.css";

const INITIAL_FORM = {
  type: "LOST",
  title: "",
  category: "",
  location: "",
  date: "",
  description: "",
  imageUrl: "",
  contactType: "WHATSAPP",
  contactValue: "",
  reporterName: "",
};

// Same order as the fields on the page. Used to find the first invalid field.
const FIELD_ORDER = [
  "type",
  "title",
  "category",
  "location",
  "date",
  "description",
  "imageUrl",
  "contactType",
  "contactValue",
  "reporterName",
];

const TYPE_PILLS = [
  { value: "LOST", label: "Lost an Item", className: "sr-type-lost" },
  { value: "FOUND", label: "Found an Item", className: "sr-type-found" },
];

const LIMITS = {
  title: 120,
  description: 1000,
  imageUrl: 2048,
  contactValue: 120,
  reporterName: 80,
};

const TOO_MANY_MESSAGE =
  "Too many submissions. Please wait a minute and try again.";

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getImageUrlError(value) {
  const url = value.trim();
  if (!url) return ""; // optional field
  if (url.length > LIMITS.imageUrl) {
    return `Photo link must be ${LIMITS.imageUrl} characters or fewer.`;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "Photo link must start with http:// or https://.";
    }
  } catch {
    return "Enter a full link that starts with http:// or https://.";
  }
  return "";
}

function validate(form) {
  const errors = {};

  if (!form.type) errors.type = "Please choose Lost or Found.";
  if (!form.title.trim()) errors.title = "Please enter the item name.";
  if (!form.category) errors.category = "Please choose a category.";
  if (!form.location) errors.location = "Please select where it was lost or found.";
  if (!form.date) {
    errors.date = `Please pick the date it was ${form.type === "FOUND" ? "found" : "lost"}.`;
  }
  if (!form.description.trim()) {
    errors.description = "Please add a short description.";
  }

  const imageUrlError = getImageUrlError(form.imageUrl);
  if (imageUrlError) errors.imageUrl = imageUrlError;

  const contact = form.contactValue.trim();
  if (!contact) {
    errors.contactValue = "Please enter how students can reach you.";
  } else if (
    form.contactType === "EMAIL" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
  ) {
    errors.contactValue = "Please enter a valid email address.";
  }

  if (!form.reporterName.trim()) {
    errors.reporterName = "Please enter your name for the private record.";
  }

  return errors;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Label + control + helper text + error text, stacked. */
function Field({ id, label, helper, error, children }) {
  return (
    <div className="sr-field">
      <label className="sr-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {helper && (
        <p className="sr-helper" id={`${id}-help`}>
          {helper}
        </p>
      )}
      {error && (
        <p className="sr-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** aria-describedby value that points at whichever helper/error text exists. */
function describedBy(id, helper, error) {
  const ids = [];
  if (helper) ids.push(`${id}-help`);
  if (error) ids.push(`${id}-error`);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

export default function SubmitReport() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // null | { type: "success" } | { type: "error", message }
  const [status, setStatus] = useState(null);
  // Asks the page to scroll to + focus something after the next render.
  const [focusRequest, setFocusRequest] = useState(null);

  const statusRef = useRef(null);
  const submitInFlightRef = useRef(false);
  const focusCounterRef = useRef(0);

  const activeContact =
    CONTACT_TYPES.find((c) => c.value === form.contactType) || CONTACT_TYPES[0];

  const dateLabel = form.type === "FOUND" ? "Date found" : "Date lost";

  // Scroll to and focus the status banner or a field. This runs after React
  // has re-enabled the form, so focusing a field always works.
  useEffect(() => {
    if (!focusRequest) return;
    const el =
      focusRequest.target === "status"
        ? statusRef.current
        : document.getElementById(
            focusRequest.target === "type" ? "type-LOST" : focusRequest.target,
          );
    if (!el) return;
    el.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "center",
    });
    el.focus({ preventScroll: true });
  }, [focusRequest]);

  const requestFocus = (target) => {
    focusCounterRef.current += 1;
    setFocusRequest({ target, id: focusCounterRef.current });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (status) setStatus(null);
  };

  const handleClear = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitInFlightRef.current) return;
    setStatus(null);

    const nextErrors = validate(form);
    setErrors(nextErrors);
    const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);
    if (firstInvalid) {
      requestFocus(firstInvalid);
      return;
    }

    submitInFlightRef.current = true;
    setIsSubmitting(true);

    try {
      await createReport({ ...form, imageUrl: form.imageUrl.trim() });
      setForm(INITIAL_FORM);
      setErrors({});
      setStatus({ type: "success" });
      requestFocus("status");
    } catch (err) {
      // Put each API field error under its own field.
      const mapped = {};
      const unmapped = [];
      const apiErrors = Array.isArray(err.fieldErrors) ? err.fieldErrors : [];
      apiErrors.forEach(({ field, message }) => {
        if (!message) return;
        if (FIELD_ORDER.includes(field)) {
          mapped[field] = message;
        } else {
          unmapped.push(message);
        }
      });

      const firstMapped = FIELD_ORDER.find((field) => mapped[field]);
      if (firstMapped) {
        setErrors((prev) => ({ ...prev, ...mapped }));
      }

      let message;
      if (err.status === 429) {
        message = TOO_MANY_MESSAGE;
      } else if (firstMapped) {
        message = "Please fix the highlighted fields and try again.";
      } else {
        message =
          unmapped[0] ||
          err.message ||
          "Couldn't post your report. Please try again.";
      }

      setStatus({ type: "error", message });
      requestFocus(firstMapped && err.status !== 429 ? firstMapped : "status");
    } finally {
      setIsSubmitting(false);
      submitInFlightRef.current = false;
    }
  };

  const controlProps = (name, helper) => ({
    id: name,
    name,
    value: form[name],
    onChange: handleChange,
    className: "field-control",
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": describedBy(name, helper, errors[name]),
  });

  const PHOTO_HELPER =
    "Leave blank to automatically show a matching category illustration.";
  const NAME_HELPER =
    "Used only for internal record—never shown on browse cards or opened reports.";

  return (
    <>
      <PageBand
        title="Submit a Report"
        subtitle="Fill out the details below to post a lost or found item at CSUI."
        icon={<EditNoteIcon />}
      />

      <main className="sr-main">
        {status?.type === "success" && (
          <div
            className="sr-banner sr-banner-success"
            role="status"
            tabIndex={-1}
            ref={statusRef}
          >
            <div className="sr-banner-body">
              <span className="sr-banner-icon" aria-hidden="true">
                <CheckCircleIcon />
              </span>
              <div>
                <h2 className="sr-banner-title">Report posted to the board</h2>
                <p className="sr-banner-text">
                  Your report is now visible in View Report. Your name stays
                  private.
                </p>
              </div>
            </div>
            <Link to="/" className="pill-btn pill-btn-primary sr-banner-action">
              <span>Browse Reports</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}

        {status?.type === "error" && (
          <div
            className="sr-banner sr-banner-error"
            role="alert"
            tabIndex={-1}
            ref={statusRef}
          >
            <div>
              <h2 className="sr-banner-title">Couldn’t post your report</h2>
              <p className="sr-banner-text">{status.message}</p>
            </div>
          </div>
        )}

        <form className="sr-form" onSubmit={handleSubmit} noValidate>
          <fieldset className="sr-fields" disabled={isSubmitting}>
            {/* Report type */}
            <fieldset className="sr-types">
              <legend className="eyebrow sr-legend">Report Type</legend>
              <div className="sr-types-grid">
                {TYPE_PILLS.map((pill) => (
                  <label className="sr-type" key={pill.value}>
                    <input
                      type="radio"
                      id={`type-${pill.value}`}
                      name="type"
                      value={pill.value}
                      checked={form.type === pill.value}
                      onChange={handleChange}
                      className="sr-visually-hidden"
                    />
                    <span className={`sr-type-pill ${pill.className}`}>
                      {pill.label}
                    </span>
                  </label>
                ))}
              </div>
              {errors.type && (
                <p className="sr-error" role="alert">
                  {errors.type}
                </p>
              )}
            </fieldset>

            {/* Item name + Category */}
            <div className="sr-grid-2">
              <Field id="title" label="Item name" error={errors.title}>
                <input
                  {...controlProps("title")}
                  type="text"
                  maxLength={LIMITS.title}
                  placeholder="e.g., Black Corkcicle Tumbler"
                  autoComplete="off"
                  aria-required="true"
                />
              </Field>

              <Field id="category" label="Category" error={errors.category}>
                <select {...controlProps("category")} aria-required="true">
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Location + Date */}
            <div className="sr-grid-2">
              <Field
                id="location"
                label="Campus location"
                error={errors.location}
              >
                <select {...controlProps("location")} aria-required="true">
                  <option value="">Select location</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="date" label={dateLabel} error={errors.date}>
                <input
                  {...controlProps("date")}
                  type="date"
                  max={getTodayDateString()}
                  aria-required="true"
                />
              </Field>
            </div>

            {/* Description */}
            <Field
              id="description"
              label="Description"
              error={errors.description}
            >
              <textarea
                {...controlProps("description")}
                rows={3}
                maxLength={LIMITS.description}
                placeholder="Describe color, stickers, or exact spot on campus..."
                aria-required="true"
              />
            </Field>

            {/* Photo link */}
            <Field
              id="imageUrl"
              label="Photo link (optional)"
              helper={PHOTO_HELPER}
              error={errors.imageUrl}
            >
              <input
                {...controlProps("imageUrl", PHOTO_HELPER)}
                type="url"
                inputMode="url"
                maxLength={LIMITS.imageUrl}
                placeholder="https://..."
                autoComplete="off"
                spellCheck={false}
              />
            </Field>

            {/* Contact method + value */}
            <div className="sr-grid-2">
              <Field id="contactType" label="Contact method">
                <select {...controlProps("contactType")}>
                  {CONTACT_TYPES.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                id="contactValue"
                label="Contact handle or number"
                error={errors.contactValue}
              >
                <input
                  {...controlProps("contactValue")}
                  type="text"
                  maxLength={LIMITS.contactValue}
                  placeholder={activeContact.placeholder}
                  autoComplete="off"
                  aria-required="true"
                />
              </Field>
            </div>

            {/* Private name */}
            <div className="stitched sr-callout">
              <Field
                id="reporterName"
                label="Your name (private)"
                helper={NAME_HELPER}
                error={errors.reporterName}
              >
                <input
                  {...controlProps("reporterName", NAME_HELPER)}
                  type="text"
                  maxLength={LIMITS.reporterName}
                  placeholder="Your full name"
                  autoComplete="name"
                  aria-required="true"
                />
              </Field>
            </div>

            {/* Actions */}
            <div className="sr-actions">
              <button
                type="button"
                className="pill-btn pill-btn-secondary"
                onClick={handleClear}
              >
                Clear Form
              </button>
              <button type="submit" className="pill-btn pill-btn-primary">
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <span>Submit Report</span>
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </div>
          </fieldset>
        </form>
      </main>
    </>
  );
}
