import { prisma } from "../config/prisma.js";

function toReport(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    category: row.category,
    location: row.location,
    date: row.date.toISOString(),
    imageUrl: row.imageUrl,
    reporterName: row.reporterName,
    contact: {
      type: row.contactType,
      value: row.contactValue,
    },
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function buildWhere({ q, type, category, location, date }) {
  const where = {};

  if (q) {
    where.title = { contains: q, mode: "insensitive" };
  }

  if (type) {
    where.type = type.toUpperCase();
  }

  if (category) {
    where.category = category.toUpperCase();
  }

  if (location) {
    where.location = location;
  }

  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    where.date = { gte: start, lt: end };
  }

  return where;
}

/** Filters and sorts reports without paginating them. */
export async function queryReports({ q, type, category, location, date, sort }) {
  const rows = await prisma.report.findMany({
    where: buildWhere({ q, type, category, location, date }),
    orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
  });

  return rows.map(toReport);
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function findReportById(id) {
  if (typeof id !== "string" || !UUID_PATTERN.test(id)) {
    return null;
  }
  const row = await prisma.report.findUnique({ where: { id } });
  return row ? toReport(row) : null;
}

export async function insertReport(report) {
  const row = await prisma.report.create({
    data: {
      id: report.id,
      title: report.title,
      description: report.description,
      type: report.type,
      category: report.category,
      location: report.location,
      date: new Date(report.date),
      imageUrl: report.imageUrl,
      reporterName: report.reporterName,
      contactType: report.contact.type,
      contactValue: report.contact.value,
      createdAt: new Date(report.createdAt),
      updatedAt: new Date(report.updatedAt),
    },
  });

  return toReport(row);
}
