import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MapPin,
  Maximize2,
  MessageCircle,
  Share2,
  Tag,
  X,
} from "lucide-react";
import SafeImage from "../components/SafeImage";
import { CheckCircleIcon, CopyIcon } from "../components/Icons";
import {
  CATEGORY_LABELS,
  CONTACT_TYPE_LABELS,
} from "../constants/reportOptions";
import { getReportById } from "../services/reportsApi";
import { buildCloudinaryUrl } from "../utils/cloudinary";
import { formatShortDate } from "../utils/formatDate";
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
      <ArrowLeft size={16} aria-hidden="true" />
      Back to all reports
    </Link>
  );
}

function getReportUrl(id) {
  const url = new URL(window.location.href);
  url.hash = `#/reports/${encodeURIComponent(id)}`;
  url.search = "";
  return url.toString();
}

export default function ReportDetails() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [copyState, setCopyState] = useState("idle"); // idle | done | failed
  const copyTimer = useRef(null);
  const [shareState, setShareState] = useState("idle"); // idle | done | failed
  const shareTimer = useRef(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    setStatus("loading");
    setError(null);
    setCopyState("idle");
    setShareState("idle");
    setLightboxOpen(false);

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

  useEffect(
    () => () => {
      clearTimeout(copyTimer.current);
      clearTimeout(shareTimer.current);
    },
    []
  );

  // showModal handles focus trapping, Escape and focus restoration.
  useEffect(() => {
    const dialog = lightboxRef.current;
    if (!dialog) return;
    if (lightboxOpen && !dialog.open) dialog.showModal();
    else if (!lightboxOpen && dialog.open) dialog.close();
  }, [lightboxOpen]);

  const handleCopy = async () => {
    const ok = await copyText(report?.contact?.value || "");
    setCopyState(ok ? "done" : "failed");
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyState("idle"), 2000);
  };

  const handleShare = async () => {
    const ok = await copyText(getReportUrl(report.id));
    setShareState(ok ? "done" : "failed");
    clearTimeout(shareTimer.current);
    shareTimer.current = setTimeout(() => setShareState("idle"), 2000);
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
  const contactType = report.contact?.type;
  const contactLabel = CONTACT_TYPE_LABELS[contactType] || contactType;
  const ContactIcon = contactType === "EMAIL" ? Mail : MessageCircle;

  return (
    <main className="container rd-page">
      <div className="rd-topbar">
        <BackLink />
        <button
          type="button"
          className="pill-btn pill-btn-secondary rd-share"
          onClick={handleShare}
        >
          <span>
            {shareState === "done"
              ? "Link copied"
              : shareState === "failed"
                ? "Couldn’t copy"
                : "Share report"}
          </span>
          {shareState === "done" ? (
            <CheckCircleIcon width="16" height="16" aria-hidden="true" />
          ) : (
            <Share2 size={16} aria-hidden="true" />
          )}
        </button>
        <span className="sr-only" role="status">
          {shareState === "done"
            ? "Report link copied to clipboard."
            : shareState === "failed"
              ? "Could not copy the report link."
              : ""}
        </span>
      </div>
      <article className="rd-card">
        <div className="rd-media">
          <SafeImage
            key={report.id}
            src={report.imageUrl}
            alt={report.title}
            category={report.category}
            className="rd-img"
          />
          {report.imageUrl && (
            <button
              type="button"
              className="rd-expand"
              onClick={() => setLightboxOpen(true)}
              aria-label={`View full image of ${report.title}`}
              title="View full image"
            >
              <Maximize2 size={18} aria-hidden="true" />
            </button>
          )}
          <span className="rd-badge-overlay">
            <span
              className={`report-badge ${isFound ? "badge-found" : "badge-lost"}`}
            >
              {isFound ? "Found" : "Lost"}
            </span>
          </span>
        </div>

        <div className="rd-body">
          <h1 className="rd-title">{report.title}</h1>

          <ul className="rd-meta">
            <li className="rd-meta-row">
              <Tag size={16} className="rd-meta-icon" aria-hidden="true" />
              <span className="sr-only">Category:</span>
              <span className="rd-meta-value">{category}</span>
            </li>
            <li className="rd-meta-row">
              <MapPin size={16} className="rd-meta-icon" aria-hidden="true" />
              <span className="sr-only">Location:</span>
              <span className="rd-meta-value">{report.location}</span>
            </li>
            <li className="rd-meta-row">
              <CalendarDays
                size={16}
                className="rd-meta-icon"
                aria-hidden="true"
              />
              <span className="sr-only">
                {isFound ? "Date found:" : "Date lost:"}
              </span>
              <time className="rd-meta-value" dateTime={report.date}>
                {formatShortDate(report.date)}
              </time>
            </li>
          </ul>

          <p className="rd-desc">{report.description}</p>

          {report.contact?.value && (
            <div className="rd-contact">
              <div className="rd-contact-text">
                <span className="rd-contact-label">
                  <ContactIcon size={16} aria-hidden="true" />
                  Contact via {contactLabel}
                </span>
                <p className="rd-contact-value">{report.contact.value}</p>
              </div>
              <button
                type="button"
                className="pill-btn pill-btn-primary"
                onClick={handleCopy}
              >
                <span>
                  {copyState === "done"
                    ? "Copied!"
                    : copyState === "failed"
                      ? "Couldn’t copy"
                      : "Copy contact"}
                </span>
                {copyState === "done" ? (
                  <CheckCircleIcon width="18" height="18" aria-hidden="true" />
                ) : (
                  <CopyIcon width="18" height="18" aria-hidden="true" />
                )}
              </button>
            </div>
          )}
        </div>
      </article>

      {report.imageUrl && (
        <dialog
          ref={lightboxRef}
          className="rd-lightbox"
          aria-label={`Full image of ${report.title}`}
          onClose={() => setLightboxOpen(false)}
          onClick={(e) => {
            if (e.target === lightboxRef.current) setLightboxOpen(false);
          }}
        >
          <div className="rd-lightbox-inner">
            <button
              type="button"
              className="rd-lightbox-close"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close image viewer"
              title="Close"
            >
              <X size={22} aria-hidden="true" />
            </button>
            <SafeImage
              src={buildCloudinaryUrl(
                report.imageUrl,
                "c_limit,w_1600,f_webp,q_85"
              )}
              alt={report.title}
              category={report.category}
              className="rd-lightbox-img"
              loading="eager"
            />
          </div>
        </dialog>
      )}
    </main>
  );
}
