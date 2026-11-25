import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { CloseIcon, LogoMark, MenuIcon } from "./Icons";
import "./Navbar.css";

const LINKS = [
  { to: "/", label: "View Report", end: true },
  { to: "/submit", label: "Submit Report" },
  { to: "/about", label: "About" },
];

// Wavy underline under the current page's link
function Squiggle() {
  return (
    <svg
      className="navbar-squiggle"
      viewBox="0 0 96 8"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 5C10 1.5 18 7 26 4C34 1 42 7 50 4C58 1 66 7 74 4C82 1 88 6 94 3.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile menu whenever the page changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ...or when Escape is pressed
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <LogoMark className="navbar-brand-icon" size={24} />
          <span>404 Found</span>
        </Link>

        {/* Desktop links */}
        <nav className="navbar-nav" aria-label="Primary navigation">
          {LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `navbar-link${isActive ? " active" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{label}</span>
                  {isActive && <Squiggle />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="navbar-toggle"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>

      {/* Mobile drawer. The shell stays mounted so its height can animate;
          inert keeps the closed links out of focus and the a11y tree. */}
      <div
        className={`navbar-drawer-shell${open ? " is-open" : ""}`}
        aria-hidden={!open}
      >
        <nav
          id="mobile-nav"
          className="navbar-drawer"
          aria-label="Mobile navigation"
          inert={!open ? "" : undefined}
        >
          {LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `navbar-drawer-link${isActive ? " active" : ""}`
              }
            >
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
