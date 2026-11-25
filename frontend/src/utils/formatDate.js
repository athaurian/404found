const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function parseDate(isoDate) {
  if (!isoDate) return null;
  const parsed = new Date(isoDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

/**
 * "15 Nov 2026". Report dates are stored as midnight UTC, so they are read in
 * UTC to avoid showing the previous day to visitors west of UTC.
 */
export function formatShortDate(isoDate) {
  const d = parseDate(isoDate);
  if (!d) return isoDate || "";
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "15/11/2026", used by the date selectors. */
export function formatNumericDate(isoDate) {
  const d = parseDate(isoDate);
  if (!d) return isoDate || "";
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

/** "Saturday, 14 November 2026" (UTC, same reason as above). */
export function formatLongDate(isoDate) {
  const d = parseDate(isoDate);
  if (!d) return isoDate || "";
  return d.toLocaleDateString("en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
