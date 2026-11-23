import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SafeImage from "../components/SafeImage";
import SearchFilterBar from "../components/SearchFilterBar";
import { CATEGORY_LABELS, SORT_OPTIONS } from "../constants/reportOptions";
import { getReports } from "../services/reportsApi";
import { CARD_IMAGE_SIZES, getCardImageSources } from "../utils/cloudinary";
import "./ViewReport.css";

const cardImagePlaceholder = (
  <div className="report-card-placeholder">
    <svg
      width="28"
      height="28"
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

// Report dates are stored as midnight UTC, so format them in UTC to avoid
// showing the previous day to visitors west of UTC.
function formatCardDate(isoDate) {
  if (!isoDate) return "";
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ViewReport() {
  const [searchParams, setSearchParams] = useSearchParams();

  const qParam = searchParams.get("q") || "";
  const typeParam = searchParams.get("type") || "";
  const categoryParam = searchParams.get("category") || "";
  const locationParam = searchParams.get("location") || "";
  const dateParam = searchParams.get("date") || "";
  const sortParam = searchParams.get("sort") === "oldest" ? "oldest" : "newest";
  const pageParam = searchParams.get("page") || "1";

  // Local state for instant typing while debouncing URL/API updates
  const [searchInput, setSearchInput] = useState(qParam);
  // Remembers the last search text we pushed into the URL ourselves
  const lastPushedQ = useRef(qParam);

  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    perPage: 6,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState(0);
  // Bumped by the "Try again" button to re-run the fetch
  const [reloadKey, setReloadKey] = useState(0);

  // Copy the URL into the input only when it changed from outside
  // (Reset button, browser back/forward), never for our own updates.
  useEffect(() => {
    if (qParam !== lastPushedQ.current) {
      lastPushedQ.current = qParam;
      setSearchInput(qParam);
    }
  }, [qParam]);

  // Debounce search text -> update URL ?q=... and reset page to 1
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === qParam) return;

    const timer = setTimeout(() => {
      lastPushedQ.current = trimmed;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (trimmed) {
            next.set("q", trimmed);
          } else {
            next.delete("q");
          }
          next.set("page", "1");
          return next;
        },
        { replace: true }
      );
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput, qParam, setSearchParams]);

  // Fetch reports whenever query parameters change
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");
    setErrorStatus(0);

    getReports({
      q: qParam,
      type: typeParam,
      category: categoryParam,
      location: locationParam,
      date: dateParam,
      sort: sortParam,
      page: pageParam,
    })
      .then((res) => {
        if (ignore) return;
        setReports(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      })
      .catch((err) => {
        if (ignore) return;
        setReports([]);
        setPagination({
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          perPage: 6,
          hasNextPage: false,
          hasPrevPage: false,
        });
        setError(err.message || "Failed to load reports.");
        setErrorStatus(err.status || 0);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [
    qParam,
    typeParam,
    categoryParam,
    locationParam,
    dateParam,
    sortParam,
    pageParam,
    reloadKey,
  ]);

  const handleFilterChange = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      // Changing a search term or filter resets the page to 1
      next.set("page", "1");
      return next;
    });
  };

  const handleSortChange = (nextSort) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextSort === "oldest") {
        next.set("sort", "oldest");
      } else {
        next.delete("sort");
      }
      next.set("page", "1");
      return next;
    });
  };

  const handlePageChange = (targetPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(targetPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      if (prev.get("sort") === "oldest") {
        next.set("sort", "oldest");
      }
      return next;
    });
  };

  const hasActiveFilters = Boolean(
    searchInput.trim() ||
      qParam ||
      typeParam ||
      categoryParam ||
      locationParam ||
      dateParam
  );

  const pageNumbers = Array.from(
    { length: pagination.totalPages },
    (_, index) => index + 1
  );

  return (
    <main className="view-page">
      <section className="view-hero">
        <h1>Browse Reports</h1>
        <p>Lost or found something on campus? Browse reports made by others.</p>
      </section>

      <SearchFilterBar
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        filters={{
          type: typeParam,
          category: categoryParam,
          location: locationParam,
          date: dateParam,
        }}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Result count + Sort dropdown */}
      <div className="view-toolbar">
        <p className="view-result-count">
          {loading
            ? "Loading reports..."
            : `${pagination.totalItems} ${
                pagination.totalItems === 1 ? "report" : "reports"
              } found`}
        </p>

        <select
          className="view-sort-select"
          aria-label="Sort reports"
          value={sortParam}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="view-state-box view-state-error" role="alert">
          <p>{error}</p>
          {errorStatus === 400 ? (
            // 400 means the URL parameters are invalid, so clear them
            <button
              type="button"
              className="view-state-btn"
              onClick={handleReset}
            >
              Reset filters
            </button>
          ) : (
            <button
              type="button"
              className="view-state-btn"
              onClick={() => setReloadKey((k) => k + 1)}
            >
              Try again
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {!error && loading && (
        <div className="report-grid" aria-busy="true">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="report-card skeleton-card">
              <div className="report-card-media skeleton-box" />
              <div className="report-card-body">
                <div className="skeleton-line short" />
                <div className="skeleton-line medium" />
                <div className="skeleton-line long" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!error && !loading && reports.length === 0 && (
        <div className="view-state-box">
          <p>No reports match your search.</p>
          {hasActiveFilters && (
            <button
              type="button"
              className="view-state-btn"
              onClick={handleReset}
            >
              Reset filters
            </button>
          )}
        </div>
      )}

      {/* Report Grid */}
      {!error && !loading && reports.length > 0 && (
        <>
          <div className="report-grid">
            {reports.map((report) => {
              const isFound = report.type === "FOUND";
              const categoryLabel =
                CATEGORY_LABELS[report.category] || report.category;
              const cardImage = getCardImageSources(report.imageUrl);

              return (
                <Link
                  key={report.id}
                  to={`/reports/${report.id}`}
                  className="report-card"
                >
                  <div className="report-card-media">
                    <SafeImage
                      key={report.id}
                      src={cardImage.src}
                      srcSet={cardImage.srcSet}
                      sizes={CARD_IMAGE_SIZES}
                      alt={report.title}
                      className="report-card-img"
                      fallback={cardImagePlaceholder}
                    />
                  </div>

                  <div className="report-card-body">
                    <span
                      className={`report-badge ${
                        isFound ? "badge-found" : "badge-lost"
                      }`}
                    >
                      {isFound ? "Found" : "Lost"}
                    </span>
                    <h2 className="report-card-title">{report.title}</h2>
                    <p className="report-card-meta">
                      {categoryLabel} &bull; {report.location}
                    </p>
                    <p className="report-card-date">
                      {formatCardDate(report.date)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <nav className="pagination" aria-label="Report pages">
              <button
                type="button"
                className="pagination-btn"
                disabled={!pagination.hasPrevPage}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                Previous
              </button>

              <div className="pagination-pages">
                {pageNumbers.map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`pagination-num${
                      num === pagination.currentPage ? " active" : ""
                    }`}
                    aria-current={
                      num === pagination.currentPage ? "page" : undefined
                    }
                    onClick={() => handlePageChange(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="pagination-btn"
                disabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
