export const REPORT_TYPES = [
  { value: "LOST", label: "Lost" },
  { value: "FOUND", label: "Found" },
];

export const FILTER_REPORT_TYPES = [
  { value: "lost", label: "Lost" },
  { value: "found", label: "Found" },
];

export const CATEGORIES = [
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "TUMBLER", label: "Tumbler" },
  { value: "ID_CARD", label: "ID Card" },
  { value: "ACCESSORIES", label: "Accessories" },
  { value: "MISCELLANEOUS", label: "Miscellaneous" },
];

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
);

export const LOCATIONS = [
  "Classroom (A2.06)",
  "Classroom (A2.51)",
  "Gedung A",
  "Gedung Baru",
  "Kantin",
  "Pos Satpam",
  "Sekre",
  "Student Lounge (Floor 1)",
  "Student Lounge (Floor 5)",
];

export const CONTACT_TYPES = [
  {
    value: "WHATSAPP",
    label: "WhatsApp",
    placeholder: "e.g. 0812-3456-7890",
  },
  {
    value: "LINE",
    label: "LINE",
    placeholder: "e.g. budisantoso26",
  },
  {
    value: "INSTAGRAM",
    label: "Instagram",
    placeholder: "e.g. @andipratama",
  },
  {
    value: "DISCORD",
    label: "Discord",
    placeholder: "e.g. username_cs25",
  },
  {
    value: "EMAIL",
    label: "Email",
    placeholder: "e.g. name@ui.ac.id",
  },
];

export const CONTACT_TYPE_LABELS = Object.fromEntries(
  CONTACT_TYPES.map((c) => [c.value, c.label])
);

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

// Shared by the photo picker and the upload request.
export const PHOTO_CONSTRAINTS = {
  maxSizeBytes: 5 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  acceptAttr: "image/jpeg,image/png,image/webp",
};
