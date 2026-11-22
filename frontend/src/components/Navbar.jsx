import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./Navbar.css";

const NAV_LINKS = [
  { to: "/", label: "View Report", end: true },
  { to: "/submit", label: "Submit Report" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the phone menu after you click a link
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          404 Found
        </Link>

        <div className="navbar-right">
          <nav
            id="main-nav"
            className={`navbar-nav${menuOpen ? " is-open" : ""}`}
            aria-label="Main navigation"
          >
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `navbar-link${isActive ? " active" : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className="navbar-profile-btn"
            aria-label="Sign In (coming soon)"
            title="SSO UI Sign-in (Stretch Feature)"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          <button
            type="button"
            className="navbar-toggle"
            aria-controls="main-nav"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {menuOpen ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}