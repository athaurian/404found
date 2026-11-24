// Flat illustrations shown when a report has no photo (or the photo fails to
// load). One per category, each on a tinted palette background.
const INK = "#3B3221";
const BRONZE = "#D4A373";
const PAPAYA = "#DDC8A8";
const SURFACE = "#F1EADB";

const ART = {
  ELECTRONICS: {
    label: "Electronics",
    tint: "papaya",
    art: (
      <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <rect x="28" y="32" width="40" height="28" rx="8" fill={BRONZE} stroke={INK} strokeWidth="2.5" />
        <path d="M38 32V20M58 32V20" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="48" cy="46" r="5" fill={PAPAYA} stroke={INK} strokeWidth="2" />
        <path d="M48 60V74C48 78 40 80 34 80" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  TUMBLER: {
    label: "Tumbler",
    tint: "beige",
    art: (
      <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <rect x="34" y="26" width="28" height="50" rx="8" fill={INK} />
        <rect x="36" y="18" width="24" height="10" rx="4" fill={BRONZE} stroke={INK} strokeWidth="2.5" />
        <circle cx="48" cy="54" r="5" fill={PAPAYA} />
      </svg>
    ),
  },
  ID_CARD: {
    label: "ID Card",
    tint: "sage",
    art: (
      <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <rect x="20" y="28" width="56" height="40" rx="7" fill={SURFACE} stroke={INK} strokeWidth="2.5" />
        <rect x="27" y="37" width="16" height="20" rx="3" fill={BRONZE} stroke={INK} strokeWidth="2" />
        <path d="M50 40H68M50 48H65M50 56H60" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  ACCESSORIES: {
    label: "Accessories",
    tint: "papaya",
    art: (
      <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <rect x="40" y="16" width="16" height="14" rx="3" fill={BRONZE} stroke={INK} strokeWidth="2.5" />
        <rect x="40" y="66" width="16" height="14" rx="3" fill={BRONZE} stroke={INK} strokeWidth="2.5" />
        <circle cx="48" cy="48" r="20" fill={SURFACE} stroke={INK} strokeWidth="2.5" />
        <path d="M48 38V48L55 53" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  MISCELLANEOUS: {
    label: "Miscellaneous",
    tint: "beige",
    art: (
      <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <rect x="28" y="20" width="42" height="56" rx="6" fill={BRONZE} stroke={INK} strokeWidth="2.5" />
        <rect x="38" y="30" width="22" height="12" rx="2" fill={SURFACE} stroke={INK} strokeWidth="2" />
        <path d="M23 30H31M23 42H31M23 54H31M23 66H31" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
};

// Accepts API values ("ID_CARD") and display labels ("ID Card").
function keyFor(category) {
  const key = String(category || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
  return ART[key] ? key : "MISCELLANEOUS";
}

export default function CategoryArt({ category }) {
  const { label, tint, art } = ART[keyFor(category)];
  return (
    <div
      className={`category-art tint-${tint}`}
      role="img"
      aria-label={`${label} illustration`}
    >
      {art}
    </div>
  );
}
