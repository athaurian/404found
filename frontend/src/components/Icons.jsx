// Small inline SVG icons (no icon font needed). All inherit the text colour.
function Svg({ children, size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (props) => (
  <Svg {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Svg>
);

export const CloseIcon = (props) => (
  <Svg {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Svg>
);

export const MenuIcon = (props) => (
  <Svg {...props}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Svg>
);

export const CalendarIcon = (props) => (
  <Svg {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </Svg>
);

export const EditNoteIcon = (props) => (
  <Svg {...props}>
    <path d="M4 20l1.2-4.8L16.5 3.9a1.4 1.4 0 0 1 2 0l1.6 1.6a1.4 1.4 0 0 1 0 2L8.8 18.8z" />
    <path d="m14.5 6 3.5 3.5" />
  </Svg>
);

export const ChatBubbleIcon = (props) => (
  <Svg {...props}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.3A8 8 0 1 1 21 12z" />
  </Svg>
);

export const CopyIcon = (props) => (
  <Svg {...props}>
    <rect x="8" y="8" width="14" height="14" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </Svg>
);

export const CheckCircleIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

// The 404 Found logo mark (a magnifying glass with an X)
export const LogoMark = (props) => (
  <Svg {...props}>
    <path d="m13.5 8.5-5 5m0-5 5 5" />
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Svg>
);
