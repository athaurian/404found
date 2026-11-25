import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ImageIcon } from "lucide-react";
import PageBand from "../components/PageBand";
import SelectWrap from "../components/SelectWrap";
import { CheckCircleIcon, EditNoteIcon } from "../components/Icons";
import {
  CATEGORIES,
  CONTACT_TYPES,
  LOCATIONS,
  PHOTO_CONSTRAINTS,
} from "../constants/reportOptions";
import { createReport, uploadReportImage } from "../services/reportsApi";
import { formatNumericDate } from "../utils/formatDate";
import "./SubmitReport.css";

const INITIAL_FORM = {
  type: "LOST",
  title: "",
  category: "",
  location: "",
  date: "",
  description: "",
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
  "image",
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
  contactValue: 120,
  reporterName: 80,
};

const PHOTO_HELPER =
  "(Leave empty to show a matching category illustration.)";
const NAME_HELPER =
  "Used only for internal record—never shown on browse cards or opened reports.";

const TOO_MANY_MESSAGE =
  "Too many submissions. Please wait a minute and try again.";

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Validates a picked file against the shared photo constraints. */
function getPhotoError(file) {
  if (!PHOTO_CONSTRAINTS.allowedMimeTypes.includes(file.type)) {
    return "Only JPG, PNG, or WebP images are allowed.";
  }
  if (file.size > PHOTO_CONSTRAINTS.maxSizeBytes) {
    return "Image must be 5 MB or smaller.";
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
  } else if (form.date > getTodayDateString()) {
    errors.date = "Please pick a date that is not in the future.";
  }
  if (!form.description.trim()) {
    errors.description = "Please add a short description.";
  }

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const statusRef = useRef(null);
  const submitInFlightRef = useRef(false);
  const focusCounterRef = useRef(0);
  const fileInputRef = useRef(null);
  // Remembers the URL for the current file so a failed submit can retry
  // without uploading the same image twice.
  const uploadedImageRef = useRef(null);

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

  // Release the object URL when the preview is replaced or the page unmounts.
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const resetPhoto = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
    uploadedImageRef.current = null;
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePhotoSelect = (file) => {
    if (!file) return;

    const error = getPhotoError(file);
    if (error) {
      setErrors((prev) => ({ ...prev, image: error }));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    uploadedImageRef.current = null;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: "" }));
    if (status) setStatus(null);
  };

  const handleRemovePhoto = () => {
    resetPhoto();
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handlePhotoSelect(e.dataTransfer.files?.[0]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "contactType" && errors.contactValue) {
      setErrors((prev) => ({ ...prev, contactValue: "" }));
    }
    if (status) setStatus(null);
  };

  const handleClear = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setStatus(null);
    resetPhoto();
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
      let imageUrl = null;
      if (imageFile) {
        const key = `${imageFile.name}:${imageFile.size}:${imageFile.lastModified}`;
        if (uploadedImageRef.current?.key === key) {
          imageUrl = uploadedImageRef.current.imageUrl;
        } else {
          setIsUploading(true);
          const uploaded = await uploadReportImage(imageFile);
          imageUrl = uploaded.imageUrl;
          uploadedImageRef.current = { key, imageUrl };
          setIsUploading(false);
        }
      }

      await createReport({ ...form, imageUrl });
      setForm(INITIAL_FORM);
      setErrors({});
      setStatus({ type: "success" });
      resetPhoto();
      requestFocus("status");
    } catch (err) {
      // Put each API field error under its own field.
      const mapped = {};
      const unmapped = [];
      const apiErrors = Array.isArray(err.fieldErrors) ? err.fieldErrors : [];
      apiErrors.forEach(({ field, message }) => {
        if (!message) return;
        const fieldName = field === "imageUrl" ? "image" : field;
        if (FIELD_ORDER.includes(fieldName)) {
          mapped[fieldName] = message;
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
      setIsUploading(false);
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
              <ArrowRight size={18} aria-hidden="true" />
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
            <fieldset className="sr-types">
              <legend className="sr-visually-hidden">Report Type</legend>
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
                <SelectWrap>
                  <select {...controlProps("category")} aria-required="true">
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </SelectWrap>
              </Field>
            </div>

            {/* Location + Date */}
            <div className="sr-grid-2">
              <Field
                id="location"
                label="Campus location"
                error={errors.location}
              >
                <SelectWrap>
                  <select {...controlProps("location")} aria-required="true">
                    <option value="">Select location</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </SelectWrap>
              </Field>

              <Field id="date" label={dateLabel} error={errors.date}>
                <div className="sr-date">
                  <span
                    className={`sr-date-display${
                      form.date ? "" : " is-empty"
                    }`}
                    aria-hidden="true"
                  >
                    {form.date ? formatNumericDate(form.date) : "DD/MM/YYYY"}
                  </span>
                  <input
                    {...controlProps("date")}
                    type="date"
                    max={getTodayDateString()}
                    aria-required="true"
                    className="field-control sr-date-input"
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch {
                        // The browser opens its own picker
                      }
                    }}
                  />
                </div>
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

            {/* Photo: direct file selection, uploaded on submit */}
            <Field
              id="image"
              label="Photo (optional)"
              helper={PHOTO_HELPER}
              error={errors.image}
            >
              <div
                className={`sr-photo-dropzone${
                  isDragging ? " is-dragging" : ""
                }${errors.image ? " has-error" : ""}`}
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={isSubmitting ? -1 : 0}
                aria-label="Choose an item photo"
                aria-describedby={describedBy(
                  "image",
                  PHOTO_HELPER,
                  errors.image,
                )}
                onKeyDown={(e) => {
                  if (!isSubmitting && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <input
                  id="image"
                  ref={fileInputRef}
                  type="file"
                  accept={PHOTO_CONSTRAINTS.acceptAttr}
                  className="sr-visually-hidden"
                  tabIndex={-1}
                  disabled={isSubmitting}
                  onChange={(e) => handlePhotoSelect(e.target.files?.[0])}
                />

                {imagePreview ? (
                  <div className="sr-photo-preview">
                    <img
                      src={imagePreview}
                      alt="Selected item preview"
                      className="sr-photo-preview-img"
                    />
                    <div className="sr-photo-preview-info">
                      <span className="sr-photo-file-name">
                        {imageFile?.name}
                      </span>
                      <button
                        type="button"
                        className="sr-photo-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto();
                        }}
                        disabled={isSubmitting}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="sr-photo-placeholder">
                    <ImageIcon size={28} aria-hidden="true" />
                    <p className="sr-photo-title">
                      Click to choose a photo or drag and drop it here
                    </p>
                    <p className="sr-photo-hint">JPG, PNG, or WebP up to 5 MB</p>
                  </div>
                )}
              </div>
            </Field>

            {/* Contact method + value */}
            <div className="sr-grid-2">
              <Field id="contactType" label="Contact method">
                <SelectWrap>
                  <select {...controlProps("contactType")}>
                    {CONTACT_TYPES.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </SelectWrap>
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
                {isUploading ? (
                  "Uploading photo..."
                ) : isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <span>Submit Report</span>
                    <ArrowRight size={18} aria-hidden="true" />
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
