import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CATEGORIES,
  CONTACT_TYPES,
  LOCATIONS,
  REPORT_TYPES,
} from "../constants/reportOptions";
import { createReport, uploadReportImage } from "../services/reportsApi";
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

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function SubmitReport() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const uploadedImageRef = useRef({ file: null, url: "" });
  const submitInFlightRef = useRef(false);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const activeContact =
    CONTACT_TYPES.find((c) => c.value === form.contactType) || CONTACT_TYPES[0];

  const dateLabel =
    form.type === "FOUND"
      ? "Date found"
      : form.type === "LOST"
        ? "Date lost"
        : "Date lost/found";

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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        imageUrl: "Only JPG, PNG, or WebP images are allowed.",
      }));
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        imageUrl: "Image must be 5 MB or smaller.",
      }));
      e.target.value = "";
      return;
    }

    setErrors((prev) => ({ ...prev, imageUrl: "" }));
    uploadedImageRef.current = { file: null, url: "" };
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (submitStatus?.type === "error") {
      setSubmitStatus(null);
    }
  };

  const handleRemoveImage = () => {
    uploadedImageRef.current = { file: null, url: "" };
    setImageFile(null);
    setImagePreview("");
    setErrors((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = "Item name is required.";
    if (!form.type) nextErrors.type = "Please select a report type.";
    if (!form.category) nextErrors.category = "Please select a category.";
    if (!form.location) nextErrors.location = "Please select a location.";
    if (!form.date) nextErrors.date = "Please select the date lost or found.";
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

    if (submitInFlightRef.current) return;
    if (!validate()) return;

    submitInFlightRef.current = true;
    setIsSubmitting(true);

    try {
      let imageUrl = "";
      if (imageFile) {
        const cached = uploadedImageRef.current;
        if (cached.file === imageFile && cached.url) {
          imageUrl = cached.url;
        } else {
          setIsUploading(true);
          const uploaded = await uploadReportImage(imageFile);
          imageUrl = uploaded.imageUrl;
          uploadedImageRef.current = { file: imageFile, url: imageUrl };
          setIsUploading(false);
        }
      }

      const response = await createReport({ ...form, imageUrl });
      setSubmitStatus({
        type: "success",
        message: response.message || "Report submitted successfully.",
      });
      setForm(INITIAL_FORM);
      setErrors({});
      uploadedImageRef.current = { file: null, url: "" };
      setImageFile(null);
      setImagePreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      if (Array.isArray(err.fieldErrors) && err.fieldErrors.length > 0) {
        const mapped = {};
        err.fieldErrors.forEach(({ field, message }) => {
          if (field && message) mapped[field] = message;
        });
        setErrors((prev) => ({ ...prev, ...mapped }));
      }
      setSubmitStatus({
        type: "error",
        message: err.message || "Failed to submit report. Please try again.",
      });
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
      submitInFlightRef.current = false;
    }
  };

  return (
    <main className="submit-page">
      <div className="submit-header">
        <h1>Report an Item</h1>
        <p>
          Fill out the details below to post a lost or found item at FASILKOM
          UI.
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
        <div className="form-group">
          <label htmlFor="title">
            Item Name <span className="required-mark">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            maxLength={120}
            placeholder="e.g. Botol Minum"
            value={form.title}
            onChange={handleChange}
            className={errors.title ? "has-error" : ""}
            disabled={isSubmitting}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

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
              {dateLabel} <span className="required-mark">*</span>
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

        <div className="form-group">
          <label htmlFor="description">
            Description <span className="required-mark">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={1000}
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

        <div className="form-group">
          <label htmlFor="image">
            Photo <span className="optional-text">(Optional)</span>
          </label>
          <input
            ref={fileInputRef}
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="image-input"
            disabled={isSubmitting}
          />
          <p className="field-helper">JPG, PNG, or WebP, up to 5 MB.</p>
          {errors.imageUrl && (
            <span className="field-error">{errors.imageUrl}</span>
          )}
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Selected photo preview" />
              <button
                type="button"
                className="image-remove"
                onClick={handleRemoveImage}
                disabled={isSubmitting}
              >
                Remove photo
              </button>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="reporterName">
            Your Name <span className="required-mark">*</span>
          </label>
          <input
            id="reporterName"
            name="reporterName"
            type="text"
            maxLength={80}
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
              maxLength={120}
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

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/")}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isUploading
              ? "Uploading photo..."
              : isSubmitting
                ? "Submitting..."
                : "Submit Report"}
          </button>
        </div>
      </form>
    </main>
  );
}
