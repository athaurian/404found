import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageBand from "../components/PageBand";
import SafeImage from "../components/SafeImage";
import SearchFilterBar from "../components/SearchFilterBar";
import { SearchIcon } from "../components/Icons";
import { CATEGORY_LABELS, SORT_OPTIONS } from "../constants/reportOptions";
import { getReports } from "../services/reportsApi";
import {
  CARD_IMAGE_SIZES,
  getCardImageSources,
} from "../utils/cloudinary";
import { formatShortDate } from "../utils/formatDate";
import "./ViewReport.css";

const EMPTY_PAGINATION = {
  currentPage: 1,
  totalPages: 0,
  totalItems: 0,
  perPage: 6,
  hasNextPage: false,
  hasPrevPage: false,
};

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
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
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
    if (trimmed === qParam) return undefined;

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
        setPagination(EMPTY_PAGINATION);
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
    <>
      <PageBand
        title="Browse Reports"
        subtitle="Lost or found something on campus? Browse reports made by others."
        icon={<SearchIcon />}
      />

      <main className="container view-main">
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

        {/* Result count + sort */}
        <div className="view-toolbar">
          <p className="view-result-count" aria-live="polite">
            {loading
              ? "Loading reports..."
              : `${pagination.totalItems} ${
                  pagination.totalItems === 1 ? "report" : "reports"
                } found`}
          </p>

          <div className="view-sort">
            <label className="eyebrow" htmlFor="view-sort">
              Sort
            </label>
            <select
              id="view-sort"
              className="field-control view-sort-select"
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
        </div>

        {/* Error state */}
        {error && (
          <div className="view-state view-state-error" role="alert">
            <p>{error}</p>
            {errorStatus === 400 ? (
              // 400 means the URL parameters are invalid, so clear them
              <button
                type="button"
                className="pill-btn pill-btn-secondary"
                onClick={handleReset}
              >
                Reset filters
              </button>
            ) : (
              <button
                type="button"
                className="pill-btn pill-btn-secondary"
                onClick={() => setReloadKey((k) => k + 1)}
              >
                Try again
              </button>
            )}
          </div>
        )}

        {/* Loading state */}
        {!error && loading && (
          <div className="report-grid" aria-busy="true">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="report-card skeleton-card">
                <div className="report-card-media skeleton-box" />
                <div className="skeleton-line medium" />
                <div className="skeleton-line long" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!error && !loading && reports.length === 0 && (
          <div className="view-state view-state-empty stitched">
            <h2 className="view-state-title">
              Nothing here yet. Try fewer filters.
            </h2>
            {hasActiveFilters && (
              <button
                type="button"
                className="pill-btn pill-btn-secondary"
                onClick={handleReset}
              >
                Reset
              </button>
            )}
          </div>
        )}

        {/* Report grid */}
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
                      <span className="report-card-badge">
                        <span
                          className={`report-badge ${
                            isFound ? "badge-found" : "badge-lost"
                          }`}
                        >
                          {isFound ? "Found" : "Lost"}
                        </span>
                      </span>
                      <SafeImage
                        src={cardImage.src}
                        srcSet={cardImage.srcSet}
                        sizes={CARD_IMAGE_SIZES}
                        alt={report.title}
                        category={report.category}
                        className="report-card-img"
                      />
                    </div>

                    <div className="report-card-body">
                      <h2 className="report-card-title">{report.title}</h2>
                      <p className="report-card-meta">
                        {categoryLabel} &bull; {report.location}
                      </p>
                    </div>

                    <div className="report-card-footer">
                      <p className="report-card-date">
                        {formatShortDate(report.date)}
                      </p>
                      <span className="report-card-arrow" aria-hidden="true">
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <nav className="pagination" aria-label="Pagination">
                <button
                  type="button"
                  className="pill-btn pill-btn-secondary"
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
                      className={`page-num${
                        num === pagination.currentPage ? " active" : ""
                      }`}
                      aria-current={
                        num === pagination.currentPage ? "page" : undefined
                      }
                      aria-label={`Page ${num}`}
                      onClick={() => handlePageChange(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="pill-btn pill-btn-secondary"
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
    </>
  );
}
