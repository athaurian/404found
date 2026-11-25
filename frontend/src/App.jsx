import { useEffect } from "react";
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import ReportDetails from "./pages/ReportDetails";
import SubmitReport from "./pages/SubmitReport";
import ViewReport from "./pages/ViewReport";

// Start every new page at the top
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <div className="app-shell">
        <Navbar />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<ViewReport />} />
            <Route path="/reports/:id" element={<ReportDetails />} />
            <Route path="/submit" element={<SubmitReport />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}
