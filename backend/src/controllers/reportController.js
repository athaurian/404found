import { randomUUID } from "node:crypto";
import { parseReportDate } from "../config/date.js";
import {
  CATEGORIES,
  FILTER_TYPES,
  INVALID_PAGE_MESSAGE,
  LOCATIONS,
  PER_PAGE,
  SORT_ORDERS,
} from "../config/constants.js";
import {
  findReportById,
  insertReport,
  queryReports,
} from "../data/reportStore.js";
import { HttpError } from "../middlewares/errorHandler.js";

function readQuery(value, name) {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new HttpError(400, `${name} must be a single value`);
  }
  return value.trim() === "" ? undefined : value.trim();
}

function readPage(value) {
  if (value === undefined) {
    return 1;
  }
  if (
    typeof value !== "string" ||
    !/^\d+$/.test(value.trim()) ||
    Number(value) < 1
  ) {
    throw new HttpError(400, INVALID_PAGE_MESSAGE);
  }
  return Number(value);
}

export async function listReports(req, res, next) {
  try {
    const q = readQuery(req.query.q, "q");
    const rawType = readQuery(req.query.type, "type");
    const rawCategory = readQuery(req.query.category, "category");
    const location = readQuery(req.query.location, "location");
    const rawDate = readQuery(req.query.date, "date");
    const rawSort = readQuery(req.query.sort, "sort");
    const page = readPage(req.query.page);

    const type = rawType?.toLowerCase();
    if (type && !FILTER_TYPES.includes(type)) {
      throw new HttpError(400, "Type must be lost or found");
    }

    const category = rawCategory?.toUpperCase();
    if (category && !CATEGORIES.includes(category)) {
      throw new HttpError(
        400,
        `Category must be one of: ${CATEGORIES.join(", ")}`
      );
    }

    if (location && !LOCATIONS.includes(location)) {
      throw new HttpError(400, "Location must be one of the shared locations");
    }

    const sort = rawSort?.toLowerCase() ?? "newest";
    if (!SORT_ORDERS.includes(sort)) {
      throw new HttpError(400, "Sort must be newest or oldest");
    }

    let date;
    if (rawDate) {
      const parsed = parseReportDate(rawDate);
      if (!parsed) {
        throw new HttpError(400, "Date must use YYYY-MM-DD or dd/mm/yyyy");
      }
      date = parsed.slice(0, 10);
    }

    const reports = await queryReports({
      q,
      type,
      category,
      location,
      date,
      sort,
    });
    const totalItems = reports.length;
    const totalPages = Math.ceil(totalItems / PER_PAGE);
    const currentPage =
      totalPages > 0 ? Math.min(page, totalPages) : page;
    const start = (currentPage - 1) * PER_PAGE;

    res.json({
      status: "success",
      message: "Reports retrieved successfully",
      data: reports
        .slice(start, start + PER_PAGE)
        .map(({ contact, ...report }) => report),
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        perPage: PER_PAGE,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getReport(req, res, next) {
  try {
    const report = await findReportById(req.params.id);
    if (!report) {
      throw new HttpError(
        404,
        "Report with the specified ID was not found."
      );
    }
    res.json({ status: "success", data: report });
  } catch (err) {
    next(err);
  }
}

export async function createReport(req, res, next) {
  try {
    const input = req.validatedReport;
    const now = new Date().toISOString();
    const report = {
      id: randomUUID(),
      title: input.title,
      description: input.description,
      type: input.type,
      category: input.category,
      location: input.location,
      date: input.date,
      imageUrl: input.imageUrl,
      reporterName: input.reporterName,
      contact: {
        type: input.contactType,
        value: input.contactValue,
      },
      createdAt: now,
      updatedAt: now,
    };

    const stored = await insertReport(report);
    console.log(`Report created: ${stored.id} (${stored.title})`);

    res.status(201).json({
      status: "success",
      message: "Report submitted successfully",
      data: stored,
    });
  } catch (err) {
    next(err);
  }
}
