import { RotateCcw } from "lucide-react";
import {
  CATEGORIES,
  FILTER_REPORT_TYPES,
  LOCATIONS,
} from "../constants/reportOptions";
import { CalendarIcon, CloseIcon, SearchIcon } from "./Icons";
import SelectWrap from "./SelectWrap";
import { formatNumericDate } from "../utils/formatDate";
import "./SearchFilterBar.css";

export default function SearchFilterBar({
  searchInput,
  onSearchInputChange,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
}) {
  return (
    <section className="filter-card" aria-label="Search and filter reports">
      <div className="filter-grid">
        {/* Search by item name */}
        <div className="filter-field filter-search">
          <label className="eyebrow" htmlFor="filter-q">
            Search item
          </label>
          <div className="filter-search-box">
            <SearchIcon size={20} className="filter-search-icon" />
            <input
              id="filter-q"
              type="text"
              className="field-control filter-search-input"
              placeholder="Search by item name..."
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                className="filter-clear"
                aria-label="Clear search"
                onClick={() => onSearchInputChange("")}
              >
                <CloseIcon size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Type */}
        <div className="filter-field">
          <label className="eyebrow" htmlFor="filter-type">
            Type
          </label>
          <SelectWrap>
            <select
              id="filter-type"
              className="field-control filter-control"
              value={filters.type}
              onChange={(e) => onFilterChange("type", e.target.value)}
            >
              <option value="">All</option>
              {FILTER_REPORT_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </SelectWrap>
        </div>

        {/* Category */}
        <div className="filter-field">
          <label className="eyebrow" htmlFor="filter-category">
            Category
          </label>
          <SelectWrap>
            <select
              id="filter-category"
              className="field-control filter-control"
              value={filters.category}
              onChange={(e) => onFilterChange("category", e.target.value)}
            >
              <option value="">All</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </SelectWrap>
        </div>

        {/* Location */}
        <div className="filter-field">
          <label className="eyebrow" htmlFor="filter-location">
            Location
          </label>
          <SelectWrap>
            <select
              id="filter-location"
              className="field-control filter-control"
              value={filters.location}
              onChange={(e) => onFilterChange("location", e.target.value)}
            >
              <option value="">All</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </SelectWrap>
        </div>

        {/* Date (the real input is invisible on top, so every browser looks the same) */}
        <div className="filter-field">
          <label className="eyebrow" htmlFor="filter-date">
            Date
          </label>
          <div className="filter-date">
            <span className="filter-date-display" aria-hidden="true">
              <span className="filter-date-text">
                {filters.date ? formatNumericDate(filters.date) : "All dates"}
              </span>
              {!filters.date && (
                <CalendarIcon size={16} className="filter-date-icon" />
              )}
            </span>
            <input
              id="filter-date"
              type="date"
              className="filter-date-input"
              value={filters.date}
              onChange={(e) => onFilterChange("date", e.target.value)}
              onClick={(e) => {
                try {
                  e.currentTarget.showPicker?.();
                } catch {
                  // The browser opens its own picker
                }
              }}
            />
            {filters.date && (
              <button
                type="button"
                className="filter-clear filter-date-clear"
                aria-label="Clear date filter"
                onClick={() => onFilterChange("date", "")}
              >
                <CloseIcon size={16} />
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          className="filter-reset"
          onClick={onReset}
          disabled={!hasActiveFilters}
          aria-label="Reset filters"
          title="Reset filters"
        >
          <RotateCcw size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
