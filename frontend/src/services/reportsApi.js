import initialMockReports from "../data/reports.json";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Defaults to true for Checkpoint 2 mock development.
// Set VITE_USE_MOCK_API=false in frontend/.env for Checkpoint 3 integration.
export const USE_MOCK_API =
  (import.meta.env.VITE_USE_MOCK_API ?? "true") !== "false";

const MOCK_STORAGE_KEY = "404found_mock_reports_v1";
const PER_PAGE = 6;
const INVALID_PAGE_MESSAGE =
  "Invalid value, please input a number equal-to or greater-than 1";

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

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
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
    throw new Error(INVALID_PAGE_MESSAGE);
  }
  const num = Number(str);
  if (!Number.isInteger(num) || num < 1) {
    throw new Error(INVALID_PAGE_MESSAGE);
  }
  return num;
}

/**
 * Retrieve filtered, sorted, and paginated reports (GET /reports).
 *
 * Supported params (docs/api-contract.md):
 * - q: case-insensitive partial match on title
 * - type: "lost" | "found"
 * - category: "ELECTRONICS" | "TUMBLER" | "ID_CARD" | "ACCESSORIES" | "MISCELLANEOUS"
 * - location: exact location string from shared list
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
    const pageItems = filtered.slice(startIdx, startIdx + PER_PAGE);

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

  const url = `${API_BASE_URL}/reports${query.toString() ? `?${query}` : ""}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Failed to load reports.");
  }
  return json;
}

/**
 * Retrieve a single report by UUID (GET /reports/:id).
 */
export async function getReportById(id) {
  if (USE_MOCK_API) {
    await new Promise((r) => setTimeout(r, 120));
    const reports = loadMockReports();
    const found = reports.find((item) => item.id === id);
    if (!found) {
      throw new Error("Report with the specified ID was not found.");
    }
    return {
      status: "success",
      data: found,
    };
  }

  const res = await fetch(`${API_BASE_URL}/reports/${encodeURIComponent(id)}`);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Failed to load report details.");
  }
  return json;
}

/**
 * Submit a new Lost/Found report (POST /reports).
 */
export async function createReport(payload, imageFile = null) {
  if (USE_MOCK_API) {
    await new Promise((r) => setTimeout(r, 500));

    let imageUrl = null;
    if (imageFile) {
      imageUrl = await fileToDataUrl(imageFile);
    }

    const nowIso = new Date().toISOString();
    const dateIso = payload.date
      ? new Date(`${payload.date}T00:00:00.000Z`).toISOString()
      : nowIso;

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

    const existing = loadMockReports();
    saveMockReports([created, ...existing]);

    return {
      status: "success",
      message: "Report submitted successfully",
      data: created,
    };
  }

  let res;
  if (imageFile) {
    const formData = new FormData();
    formData.append("title", payload.title.trim());
    formData.append("description", payload.description.trim());
    formData.append("type", payload.type);
    formData.append("category", payload.category);
    formData.append("location", payload.location);
    formData.append("date", payload.date);
    formData.append("reporterName", payload.reporterName.trim());
    formData.append("contactType", payload.contactType);
    formData.append("contactValue", payload.contactValue.trim());
    formData.append("image", imageFile);

    res = await fetch(`${API_BASE_URL}/reports`, {
      method: "POST",
      body: formData,
    });
  } else {
    res = await fetch(`${API_BASE_URL}/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      }),
    });
  }

  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.message || "Failed to submit report.");
    err.fieldErrors = Array.isArray(json.errors) ? json.errors : [];
    throw err;
  }

  return json;
}
