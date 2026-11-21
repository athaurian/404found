import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ViewReport from "./pages/ViewReport";
import ReportDetails from "./pages/ReportDetails";
import SubmitReport from "./pages/SubmitReport";
import About from "./pages/About";

export default function App() {
  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<ViewReport />} />
        <Route path="/reports/:id" element={<ReportDetails />} />
        <Route path="/submit" element={<SubmitReport />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}