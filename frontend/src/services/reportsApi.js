import initialMockReports from "../data/reports.json";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://optiplex.tail1e8f95.ts.net/api";

// Mock data is for local development only: it needs VITE_USE_MOCK_API=true in
// frontend/.env AND a dev build. A production build (`npm run build`) always
// uses the live API, even if a local .env still says "true".
export const USE_MOCK_API =
  !import.meta.env.PROD && import.meta.env.VITE_USE_MOCK_API === "true";

const MOCK_STORAGE_KEY = "404found_mock_reports_v1";
const PER_PAGE = 6;
const INVALID_PAGE_MESSAGE =
  "Invalid value, please input a number equal-to or greater-than 1";

/**
 * Error thrown by every function in this file (mock and live).
 * - status: HTTP status (0 when the server could not be reached)
 * - fieldErrors: [{ field, message }] from a 400 validation response
 */
export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = [] } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * fetch wrapper: handles network failures, non-JSON bodies and error statuses.
 */
async function request(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch {
    throw new ApiError(
      "Can't reach the server. Check your connection and try again."
    );
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // Body was not JSON (for example a proxy error page)
  }

  if (!res.ok) {
    const fallback =
      res.status === 429
        ? "Too many submissions. Please wait a minute and try again."
        : `Something went wrong (error ${res.status}).`;
    throw new ApiError(json?.message || fallback, {
      status: res.status,
      fieldErrors: Array.isArray(json?.errors) ? json.errors : [],
    });
  }

  if (!json) {
    throw new ApiError("Unexpected response from the server.", {
      status: res.status,
    });
  }

  return json;
}

/* ------------------------------ Mock helpers ------------------------------ */

function loadMockReports() {
  try {
    const saved = localStorage.getItem(MOCK_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Fallback to static mock dataset
  }
  return [...initialMockReports];
}

function saveMockReports(reports) {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(reports));
  } catch {
    // Ignore storage quota issues for large data URLs in mock mode
  }
}

function generateMockUuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Normalizes a YYYY-MM-DD or dd/mm/yyyy date string into YYYY-MM-DD.
 */
function normalizeDateFilter(dateStr) {
  if (!dateStr) return "";
  const trimmed = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const dmyMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return `${year}-${month}-${day}`;
  }
  return trimmed;
}

/**
 * Validates the page query param per docs/api-contract.md.
 */
function parseValidPage(pageParam) {
  if (pageParam === undefined || pageParam === null || pageParam === "") {
    return 1;
  }
  const str = String(pageParam).trim();
  if (!/^\d+$/.test(str)) {
    throw new ApiError(INVALID_PAGE_MESSAGE, { status: 400 });
  }
  const num = Number(str);
  if (!Number.isInteger(num) || num < 1) {
    throw new ApiError(INVALID_PAGE_MESSAGE, { status: 400 });
  }
  return num;
}

/* ------------------------------- Public API ------------------------------- */

/**
 * GET /reports
 *
 * Params (docs/api-contract.md):
 * - q: case-insensitive partial match on title
 * - type: "lost" | "found"
 * - category: ELECTRONICS | TUMBLER | ID_CARD | ACCESSORIES | MISCELLANEOUS
 * - location: exact location string from the shared list
 * - date: "YYYY-MM-DD" or "dd/mm/yyyy"
 * - sort: "newest" | "oldest"
 * - page: integer >= 1
 */
export async function getReports(params = {}) {
  if (USE_MOCK_API) {
    await new Promise((r) => setTimeout(r, 150));

    const requestedPage = parseValidPage(params.page);
    const reports = loadMockReports();

    const q = (params.q || "").trim().toLowerCase();
    const type = (params.type || "").trim().toUpperCase();
    const category = (params.category || "").trim().toUpperCase();
    const location = (params.location || "").trim();
    const date = normalizeDateFilter(params.date);
    const sort = params.sort === "oldest" ? "oldest" : "newest";

    const filtered = reports.filter((report) => {
      if (q && !report.title.toLowerCase().includes(q)) {
        return false;
      }
      if (type && report.type.toUpperCase() !== type) {
        return false;
      }
      if (category && report.category.toUpperCase() !== category) {
        return false;
      }
      if (location && report.location !== location) {
        return false;
      }
      if (date) {
        const reportDate = String(report.date || "").slice(0, 10);
        if (reportDate !== date) {
          return false;
        }
      }
      return true;
    });

    filtered.sort((a, b) => {
      const diff = new Date(b.createdAt) - new Date(a.createdAt);
      return sort === "oldest" ? -diff : diff;
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / PER_PAGE);
    const currentPage =
      totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;
    const startIdx = (currentPage - 1) * PER_PAGE;

    // The real list endpoint omits `contact`, so the mock does too.
    const pageItems = filtered
      .slice(startIdx, startIdx + PER_PAGE)
      .map(({ contact, ...rest }) => rest);

    return {
      status: "success",
      message: "Reports retrieved successfully",
      data: pageItems,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        perPage: PER_PAGE,
        hasNextPage: totalPages > 0 && currentPage < totalPages,
        hasPrevPage: totalPages > 0 && currentPage > 1,
      },
    };
  }

  const query = new URLSearchParams();
  if (params.q && params.q.trim()) query.set("q", params.q.trim());
  if (params.type) query.set("type", String(params.type).toLowerCase());
  if (params.category) query.set("category", params.category);
  if (params.location) query.set("location", params.location);
  if (params.date) query.set("date", params.date);
  if (params.sort) query.set("sort", params.sort);
  if (params.page !== undefined && params.page !== null && params.page !== "") {
    query.set("page", String(params.page));
  }

  const qs = query.toString();
  return request(`${API_BASE_URL}/reports${qs ? `?${qs}` : ""}`);
}

/**
 * GET /reports/:id
 */
export async function getReportById(id) {
  if (USE_MOCK_API) {
    await new Promise((r) => setTimeout(r, 120));
    const found = loadMockReports().find((item) => item.id === id);
    if (!found) {
      throw new ApiError("Report with the specified ID was not found.", {
        status: 404,
      });
    }
    return { status: "success", data: found };
  }

  return request(`${API_BASE_URL}/reports/${encodeURIComponent(id)}`);
}

/**
 * POST /reports
 * The API accepts JSON, with an optional `imageUrl` string for the photo.
 */
export async function createReport(payload) {
  const imageUrl = payload.imageUrl?.trim() || null;

  if (USE_MOCK_API) {
    await new Promise((r) => setTimeout(r, 500));
    const nowIso = new Date().toISOString();
    const isoDate = normalizeDateFilter(payload.date);
    const parsed = isoDate ? new Date(`${isoDate}T00:00:00.000Z`) : null;
    const dateIso =
      parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : nowIso;

    const created = {
      id: generateMockUuid(),
      title: payload.title.trim(),
      description: payload.description.trim(),
      type: payload.type,
      category: payload.category,
      location: payload.location,
      date: dateIso,
      imageUrl,
      reporterName: payload.reporterName.trim(),
      contact: {
        type: payload.contactType,
        value: payload.contactValue.trim(),
      },
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    saveMockReports([created, ...loadMockReports()]);
    return {
      status: "success",
      message: "Report submitted successfully",
      data: created,
    };
  }

  return request(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: payload.title.trim(),
      description: payload.description.trim(),
      type: payload.type,
      category: payload.category,
      location: payload.location,
      date: payload.date,
      reporterName: payload.reporterName.trim(),
      contactType: payload.contactType,
      contactValue: payload.contactValue.trim(),
      ...(imageUrl ? { imageUrl } : {}),
    }),
  });
}