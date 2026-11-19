import {
  CATEGORIES,
  FILTER_REPORT_TYPES,
  LOCATIONS,
} from "../constants/reportOptions";
import "./SearchFilterBar.css";

function formatDisplayDate(isoDate) {
  if (!isoDate) return "All dates";
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

export default function SearchFilterBar({
  searchInput,
  onSearchInputChange,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
}) {
  return (
    <section className="filter-bar" aria-label="Search and filter reports">
      {/* Search by item name */}
      <div className="filter-search">
        <svg
          className="filter-search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="filter-search-input"
          aria-label="Search by item name"
          placeholder="Search by item name..."
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
        />
        {searchInput && (
          <button
            type="button"
            className="filter-search-clear"
            aria-label="Clear search query"
            onClick={() => onSearchInputChange("")}
          >
            &times;
          </button>
        )}
      </div>

      {/* Type filter */}
      <select
        className="filter-select"
        aria-label="Filter by report type"
        value={filters.type}
        onChange={(e) => onFilterChange("type", e.target.value)}
      >
        <option value="">All types</option>
        {FILTER_REPORT_TYPES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      {/* Category filter */}
      <select
        className="filter-select"
        aria-label="Filter by category"
        value={filters.category}
        onChange={(e) => onFilterChange("category", e.target.value)}
      >
        <option value="">All categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>

      {/* Location filter */}
      <select
        className="filter-select"
        aria-label="Filter by location"
        value={filters.location}
        onChange={(e) => onFilterChange("location", e.target.value)}
      >
        <option value="">All locations</option>
        {LOCATIONS.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>

      {/* Date filter (native input kept transparent to avoid Safari/Firefox text overlap) */}
      <div className="filter-date-wrap">
        <span className="filter-date-display" aria-hidden="true">
          <span className="filter-date-text">
            {formatDisplayDate(filters.date)}
          </span>
          {!filters.date && (
            <svg
              className="filter-date-icon"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          )}
        </span>

        <input
          type="date"
          className="filter-date-input"
          aria-label="Filter by date lost or found"
          value={filters.date}
          onChange={(e) => onFilterChange("date", e.target.value)}
          onClick={(e) => {
            try {
              e.currentTarget.showPicker?.();
            } catch {
              // Native picker handled by browser
            }
          }}
        />

        {filters.date && (
          <button
            type="button"
            className="filter-date-clear"
            aria-label="Clear date filter"
            onClick={() => onFilterChange("date", "")}
          >
            &times;
          </button>
        )}
      </div>

      {/* Reset button */}
      <button
        type="button"
        className="filter-reset-btn"
        onClick={onReset}
        disabled={!hasActiveFilters}
      >
        Reset
      </button>
    </section>
  );
}
