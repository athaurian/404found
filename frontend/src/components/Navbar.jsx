import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          404 Found
        </Link>

        <nav className="navbar-nav" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `navbar-link${isActive ? " active" : ""}`
            }
          >
            View Report
          </NavLink>
          <NavLink
            to="/submit"
            className={({ isActive }) =>
              `navbar-link${isActive ? " active" : ""}`
            }
          >
            Submit Report
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `navbar-link${isActive ? " active" : ""}`
            }
          >
            About
          </NavLink>

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
        </nav>
      </div>
    </header>
  );
}
