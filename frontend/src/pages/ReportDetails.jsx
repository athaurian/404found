import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SafeImage from "../components/SafeImage";
import { CheckCircleIcon, CopyIcon } from "../components/Icons";
import {
  CATEGORY_LABELS,
  CONTACT_TYPE_LABELS,
} from "../constants/reportOptions";
import { getReportById } from "../services/reportsApi";
import { formatLongDate } from "../utils/formatDate";
import "./ReportDetails.css";

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fall back for browsers or pages where the Clipboard API is blocked
  }
  try {
    const box = document.createElement("textarea");
    box.value = text;
    box.setAttribute("readonly", "");
    box.style.position = "fixed";
    box.style.opacity = "0";
    document.body.appendChild(box);
    box.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(box);
    return ok;
  } catch {
    return false;
  }
}

function BackLink() {
  return (
    <Link to="/" className="rd-back">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </svg>
      Back to all reports
    </Link>
  );
}

export default function ReportDetails() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [copyState, setCopyState] = useState("idle"); // idle | done | failed
  const copyTimer = useRef(null);

  useEffect(() => {
    let ignore = false;
    setStatus("loading");
    setError(null);
    setCopyState("idle");

    getReportById(id)
      .then((res) => {
        if (ignore) return;
        setReport(res.data);
        setStatus("ready");
      })
      .catch((err) => {
        if (ignore) return;
        setError(err);
        setStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [id, attempt]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const handleCopy = async () => {
    const ok = await copyText(report?.contact?.value || "");
    setCopyState(ok ? "done" : "failed");
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyState("idle"), 2000);
  };

  if (status === "loading") {
    return (
      <main className="container rd-page">
        <BackLink />
        <div className="rd-card rd-skeleton" aria-busy="true">
          <span className="rd-sr" role="status">Loading report…</span>
          <div className="rd-media" />
          <div className="rd-line rd-line-short" />
          <div className="rd-line rd-line-title" />
          <div className="rd-line" />
          <div className="rd-line" />
        </div>
      </main>
    );
  }

  if (status === "error" || !report) {
    const notFound = error?.status === 404;
    return (
      <main className="container rd-page">
        <BackLink />
        <section className="stitched rd-empty" role="alert">
          <h1 className="rd-empty-title">
            {notFound ? "Report not found." : "Couldn’t load this report."}
          </h1>
          <p className="rd-empty-text">
            {notFound
              ? "It may have been removed, or the link is wrong."
              : error?.message || "Something went wrong. Please try again."}
          </p>
          <div className="rd-actions">
            {!notFound && (
              <button type="button" className="pill-btn pill-btn-primary" onClick={() => setAttempt((n) => n + 1)}>
                Try again
              </button>
            )}
            <Link to="/" className="pill-btn pill-btn-secondary">Browse reports</Link>
          </div>
        </section>
      </main>
    );
  }

  const isFound = String(report.type).toUpperCase() === "FOUND";
  const category = CATEGORY_LABELS[report.category] || report.category;
  const contactLabel = CONTACT_TYPE_LABELS[report.contact?.type] || report.contact?.type;

  return (
    <main className="container rd-page">
      <BackLink />
      <article className="rd-card">
        <div className="rd-media">
          <SafeImage key={report.id} src={report.imageUrl} alt={report.title} category={report.category} className="rd-img" />
        </div>

        <div className="rd-badge-row">
          <span className={`report-badge ${isFound ? "badge-found" : "badge-lost"}`}>
            {isFound ? "Found" : "Lost"}
          </span>
          <span className="rd-date">
            {isFound ? "Date found" : "Date lost"}: {formatLongDate(report.date)}
          </span>
        </div>

        <div className="rd-heading">
          <p className="eyebrow">{category} • {report.location}</p>
          <h1 className="rd-title">{report.title}</h1>
        </div>

        <p className="rd-desc">{report.description}</p>

        {report.contact?.value && (
          <div className="rd-contact">
            <div className="rd-contact-text">
              <span className="eyebrow">Contact via {contactLabel}</span>
              <p className="rd-contact-value">{report.contact.value}</p>
            </div>
            <button type="button" className="pill-btn pill-btn-primary" onClick={handleCopy}>
              <span>
                {copyState === "done" ? "Copied!" : copyState === "failed" ? "Couldn’t copy" : "Copy contact"}
              </span>
              {copyState === "done" ? <CheckCircleIcon width="18" height="18" aria-hidden="true" /> : <CopyIcon width="18" height="18" aria-hidden="true" />}
            </button>
          </div>
        )}
      </article>
    </main>
  );
}
