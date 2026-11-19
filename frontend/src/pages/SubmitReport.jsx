import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CATEGORIES,
  CONTACT_TYPES,
  LOCATIONS,
  PHOTO_CONSTRAINTS,
  REPORT_TYPES,
} from "../constants/reportOptions";
import { createReport } from "../services/reportsApi";
import "./SubmitReport.css";

const INITIAL_FORM = {
  title: "",
  type: "",
  category: "",
  location: "",
  date: "",
  description: "",
  reporterName: "",
  contactType: "WHATSAPP",
  contactValue: "",
};

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function SubmitReport() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const activeContact =
    CONTACT_TYPES.find((c) => c.value === form.contactType) || CONTACT_TYPES[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (submitStatus?.type === "error") {
      setSubmitStatus(null);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!PHOTO_CONSTRAINTS.allowedMimeTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Only JPG, PNG, or WebP images are allowed.",
      }));
      return;
    }

    if (file.size > PHOTO_CONSTRAINTS.maxSizeBytes) {
      setErrors((prev) => ({
        ...prev,
        image: "File size must be under 5 MB.",
      }));
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    const droppedFile = e.dataTransfer.files?.[0];
    handleFileSelect(droppedFile);
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Item name is required.";
    }
    if (!form.type) {
      nextErrors.type = "Please select a report type.";
    }
    if (!form.category) {
      nextErrors.category = "Please select a category.";
    }
    if (!form.location) {
      nextErrors.location = "Please select a location.";
    }
    if (!form.date) {
      nextErrors.date = "Please select the date lost or found.";
    }
    if (!form.description.trim()) {
      nextErrors.description = "Description is required.";
    }
    if (!form.reporterName.trim()) {
      nextErrors.reporterName = "Your name is required.";
    }
    if (!form.contactValue.trim()) {
      nextErrors.contactValue = "Contact value is required.";
    } else if (
      form.contactType === "EMAIL" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactValue.trim())
    ) {
      nextErrors.contactValue = "Please enter a valid email address.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createReport(form, imageFile);
      setSubmitStatus({
        type: "success",
        message: response.message || "Report submitted successfully.",
      });

      setForm(INITIAL_FORM);
      setErrors({});
      setImageFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      if (Array.isArray(err.fieldErrors) && err.fieldErrors.length > 0) {
        const mapped = {};
        err.fieldErrors.forEach(({ field, message }) => {
          if (field && message) {
            mapped[field] = message;
          }
        });
        setErrors((prev) => ({ ...prev, ...mapped }));
      }

      setSubmitStatus({
        type: "error",
        message: err.message || "Failed to submit report. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <main className="submit-page">
      <div className="submit-header">
        <h1>Report an Item</h1>
        <p>
          Fill out the details below to post a lost or found item at FASILKOM UI.
        </p>
      </div>

      {submitStatus && (
        <div
          className={`submit-alert submit-alert-${submitStatus.type}`}
          role="alert"
        >
          <span>{submitStatus.message}</span>
          {submitStatus.type === "success" && (
            <button
              type="button"
              className="submit-alert-link"
              onClick={() => navigate("/")}
            >
              View Reports
            </button>
          )}
        </div>
      )}

      <form className="submit-form" onSubmit={handleSubmit} noValidate>
        {/* Item Name */}
        <div className="form-group">
          <label htmlFor="title">
            Item Name <span className="required-mark">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="e.g. Botol Minum"
            value={form.title}
            onChange={handleChange}
            className={errors.title ? "has-error" : ""}
            disabled={isSubmitting}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

        {/* Type & Category */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">
              Type <span className="required-mark">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className={errors.type ? "has-error" : ""}
              disabled={isSubmitting}
            >
              <option value="">Select a type</option>
              {REPORT_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {errors.type && <span className="field-error">{errors.type}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">
              Category <span className="required-mark">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className={errors.category ? "has-error" : ""}
              disabled={isSubmitting}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="field-error">{errors.category}</span>
            )}
          </div>
        </div>

        {/* Location & Date */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">
              Location <span className="required-mark">*</span>
            </label>
            <select
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              className={errors.location ? "has-error" : ""}
              disabled={isSubmitting}
            >
              <option value="">Select a location</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            {errors.location && (
              <span className="field-error">{errors.location}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="date">
              {form.type === "FOUND" ? "Date found" : "Date lost"}{" "}
              <span className="required-mark">*</span>
            </label>
            <input
              id="date"
              name="date"
              type="date"
              max={getTodayDateString()}
              value={form.date}
              onChange={handleChange}
              className={errors.date ? "has-error" : ""}
              disabled={isSubmitting}
            />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">
            Description <span className="required-mark">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Color, brand, distinguishing marks, or additional details..."
            value={form.description}
            onChange={handleChange}
            className={errors.description ? "has-error" : ""}
            disabled={isSubmitting}
          />
          {errors.description && (
            <span className="field-error">{errors.description}</span>
          )}
        </div>

        {/* Photo Upload (Optional) */}
        <div className="form-group">
          <label htmlFor="photo-input">
            Photo <span className="optional-text">(Optional)</span>
          </label>
          <div
            className={`photo-dropzone${isDragging ? " is-dragging" : ""}${
              errors.image ? " has-error" : ""
            }`}
            onClick={() => !isSubmitting && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label="Upload item photo"
            onKeyDown={(e) => {
              if (!isSubmitting && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              id="photo-input"
              ref={fileInputRef}
              type="file"
              accept={PHOTO_CONSTRAINTS.acceptAttr}
              className="sr-only"
              disabled={isSubmitting}
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />

            {imagePreview ? (
              <div className="photo-preview">
                <img
                  src={imagePreview}
                  alt="Selected item preview"
                  className="photo-preview-img"
                />
                <div className="photo-preview-info">
                  <span className="photo-file-name">{imageFile?.name}</span>
                  <button
                    type="button"
                    className="photo-remove-btn"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="photo-placeholder">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="photo-dropzone-title">
                  Click to upload or drag and drop your file here
                </p>
                <p className="photo-dropzone-hint">
                  JPG, PNG, or WebP up to 5MB (can be left empty)
                </p>
              </div>
            )}
          </div>
          {errors.image && <span className="field-error">{errors.image}</span>}
        </div>

        {/* Reporter Name (required by API contract) */}
        <div className="form-group">
          <label htmlFor="reporterName">
            Your Name <span className="required-mark">*</span>
          </label>
          <input
            id="reporterName"
            name="reporterName"
            type="text"
            placeholder="e.g. Budi Santoso"
            value={form.reporterName}
            onChange={handleChange}
            className={errors.reporterName ? "has-error" : ""}
            disabled={isSubmitting}
          />
          {errors.reporterName && (
            <span className="field-error">{errors.reporterName}</span>
          )}
        </div>

        {/* Contact */}
        <div className="form-group">
          <label htmlFor="contactValue">
            Contact <span className="required-mark">*</span>
          </label>
          <p className="field-helper">
            Only the contact method you select below will be shown publicly on
            this report.
          </p>
          <div className="contact-row">
            <select
              id="contactType"
              name="contactType"
              aria-label="Contact method"
              value={form.contactType}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              {CONTACT_TYPES.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>

            <input
              id="contactValue"
              name="contactValue"
              type="text"
              placeholder={activeContact.placeholder}
              value={form.contactValue}
              onChange={handleChange}
              className={errors.contactValue ? "has-error" : ""}
              disabled={isSubmitting}
            />
          </div>
          {errors.contactValue && (
            <span className="field-error">{errors.contactValue}</span>
          )}
        </div>

        {/* Submit & Cancel Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>
    </main>
  );
}
