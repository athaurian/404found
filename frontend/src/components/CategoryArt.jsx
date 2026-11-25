// Category placeholder shown when a report has no usable photo. The neutral
// surface keeps Lost/Found as the only status color.
const ART = {
  ELECTRONICS: {
    label: "Electronics",
    art: (
      <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <rect
          x="28"
          y="32"
          width="40"
          height="28"
          rx="8"
          className="art-fill-control art-stroke-strong"
          strokeWidth="2.5"
        />
        <path
          d="M38 32V20M58 32V20"
          className="art-stroke-strong"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx="48"
          cy="46"
          r="5"
          className="art-fill-accent art-stroke-strong"
          strokeWidth="2"
        />
        <path
          d="M48 60V74C48 78 40 80 34 80"
          className="art-stroke-strong"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  TUMBLER: {
    label: "Tumbler",
    art: (
      <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <rect
          x="34"
          y="26"
          width="28"
          height="50"
          rx="8"
          className="art-fill-strong"
        />
        <rect
          x="36"
          y="18"
          width="24"
          height="10"
          rx="4"
          className="art-fill-control art-stroke-strong"
          strokeWidth="2.5"
        />
        <circle cx="48" cy="54" r="5" className="art-fill-accent" />
      </svg>
    ),
  },
  ID_CARD: {
    label: "ID Card",
    art: (
      <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <rect
          x="20"
          y="28"
          width="56"
          height="40"
          rx="7"
          className="art-fill-surface art-stroke-strong"
          strokeWidth="2.5"
        />
        <rect
          x="27"
          y="37"
          width="16"
          height="20"
          rx="3"
          className="art-fill-control art-stroke-strong"
          strokeWidth="2"
        />
        <path
          d="M50 40H68M50 48H65M50 56H60"
          className="art-stroke-strong"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  ACCESSORIES: {
    label: "Accessories",
    art: (
      <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <rect
          x="40"
          y="16"
          width="16"
          height="14"
          rx="3"
          className="art-fill-control art-stroke-strong"
          strokeWidth="2.5"
        />
        <rect
          x="40"
          y="66"
          width="16"
          height="14"
          rx="3"
          className="art-fill-control art-stroke-strong"
          strokeWidth="2.5"
        />
        <circle
          cx="48"
          cy="48"
          r="20"
          className="art-fill-surface art-stroke-strong"
          strokeWidth="2.5"
        />
        <path
          d="M48 38V48L55 53"
          className="art-stroke-strong"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  MISCELLANEOUS: {
    label: "Miscellaneous",
    art: (
      <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <rect
          x="28"
          y="20"
          width="42"
          height="56"
          rx="6"
          className="art-fill-control art-stroke-strong"
          strokeWidth="2.5"
        />
        <rect
          x="38"
          y="30"
          width="22"
          height="12"
          rx="2"
          className="art-fill-surface art-stroke-strong"
          strokeWidth="2"
        />
        <path
          d="M23 30H31M23 42H31M23 54H31M23 66H31"
          className="art-stroke-strong"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
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
  const { label, art } = ART[keyFor(category)];
  return (
    <div
      className="category-art"
      role="img"
      aria-label={`${label} illustration`}
    >
      {art}
    </div>
  );
}
