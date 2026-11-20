import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const seedFile = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../mock-data/reports.json"
);

const reports = JSON.parse(readFileSync(seedFile, "utf8")).map((report) => ({
  ...report,
  contact: { ...report.contact },
}));

/** Filters and sorts reports without paginating them. */
export function queryReports({ q, type, category, location, date, sort }) {
  let result = reports;

  if (q) {
    const needle = q.toLowerCase();
    result = result.filter((report) =>
      report.title.toLowerCase().includes(needle)
    );
  }

  if (type) {
    result = result.filter(
      (report) => report.type.toLowerCase() === type.toLowerCase()
    );
  }

  if (category) {
    result = result.filter((report) => report.category === category);
  }

  if (location) {
    result = result.filter((report) => report.location === location);
  }

  if (date) {
    result = result.filter((report) => report.date.slice(0, 10) === date);
  }

  const direction = sort === "oldest" ? 1 : -1;
  return [...result].sort(
    (a, b) =>
      direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  );
}

export function findReportById(id) {
  return reports.find((report) => report.id === id) ?? null;
}

export function insertReport(report) {
  reports.unshift(report);
  return report;
}
