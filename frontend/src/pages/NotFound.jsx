import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <main className="nf-page container">
      <section className="nf-card stitched" aria-labelledby="nf-title">
        <p className="nf-code" aria-hidden="true">404</p>
        <h1 id="nf-title" className="nf-title">Page not found.</h1>
        <p className="nf-text">That page isn’t on this board.</p>
        <div className="nf-actions">
          <Link to="/" className="pill-btn pill-btn-primary">
            Browse reports
          </Link>
        </div>
      </section>
    </main>
  );
}
