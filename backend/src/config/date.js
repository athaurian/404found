/** Parses `YYYY-MM-DD` or `dd/mm/yyyy` into an ISO timestamp, or null. */
export function parseReportDate(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  let year;
  let month;
  let day;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    [year, month, day] = trimmed.split("-").map(Number);
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [inputDay, inputMonth, inputYear] = trimmed.split("/").map(Number);
    year = inputYear;
    month = inputMonth;
    day = inputDay;
  } else {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  const isValid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  return isValid ? date.toISOString() : null;
}

/** Today in WIB, as YYYY-MM-DD. */
export function getTodayDateString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
