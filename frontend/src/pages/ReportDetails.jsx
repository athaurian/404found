import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SafeImage from "../components/SafeImage";
import {
  CATEGORY_LABELS,
  CONTACT_TYPE_LABELS,
} from "../constants/reportOptions";
import { getReportById } from "../services/reportsApi";
import "./ReportDetails.css";

function formatFullDate(isoDate) {
  if (!isoDate) return "";
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const imagePlaceholder = (
  <div className="detail-placeholder">
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
    <span>No image</span>
  </div>
);

export default function ReportDetails() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    getReportById(id)
      .then((res) => {
        if (!ignore) setReport(res.data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message || "Report not found.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleCopyContact = async () => {
    if (!report?.contact?.value) return;
    try {
      await navigator.clipboard.writeText(report.contact.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable
    }
  };

  if (loading) {
    return (
      <main className="detail-page">
        <p className="detail-status">Loading report details...</p>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="detail-page">
        <div className="detail-error-box" role="alert">
          <p>{error || "Report not found."}</p>
          <Link to="/" className="detail-back-btn">
            Back to View Report
          </Link>
        </div>
      </main>
    );
  }

  const isFound = report.type === "FOUND";
  const categoryLabel = CATEGORY_LABELS[report.category] || report.category;
  const contactLabel =
    CONTACT_TYPE_LABELS[report.contact?.type] || report.contact?.type;

  return (
    <main className="detail-page">
      <Link to="/" className="detail-breadcrumb">
        &larr; Back to all reports
      </Link>

      <div className="detail-layout">
        <div className="detail-media">
          <SafeImage
            key={report.id}
            src={report.imageUrl}
            alt={report.title}
            className="detail-image"
            fallback={imagePlaceholder}
          />
        </div>

        <div className="detail-info">
          <h1 className="detail-title">{report.title}</h1>

          <dl className="detail-meta-list">
            <div className="detail-meta-row">
              <dt>Type</dt>
              <dd>
                <span
                  className={`report-badge ${
                    isFound ? "badge-found" : "badge-lost"
                  }`}
                >
                  {isFound ? "Found" : "Lost"}
                </span>
              </dd>
            </div>
            <div className="detail-meta-row">
              <dt>Category</dt>
              <dd>{categoryLabel}</dd>
            </div>
            <div className="detail-meta-row">
              <dt>Location</dt>
              <dd>{report.location}</dd>
            </div>
            <div className="detail-meta-row">
              <dt>{isFound ? "Date Found" : "Date Lost"}</dt>
              <dd>{formatFullDate(report.date)}</dd>
            </div>
          </dl>

          <hr className="detail-divider" />

          <section className="detail-section">
            <h2>Description</h2>
            <p>{report.description}</p>
          </section>

          <section className="detail-section">
            <h2>Contact</h2>
            <div className="detail-contact-box">
              <span>
                <strong>{contactLabel}:</strong> {report.contact?.value}
              </span>
              <button
                type="button"
                className="detail-copy-btn"
                onClick={handleCopyContact}
                aria-label="Copy contact value"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}