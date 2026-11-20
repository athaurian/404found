import { Router } from "express";
import {
  createReport,
  getReport,
  listReports,
} from "../controllers/reportController.js";
import { submitLimiter } from "../middlewares/submitLimiter.js";
import { validateReport } from "../middlewares/validateReport.js";

const router = Router();

router.get("/", listReports);
router.get("/:id", getReport);
router.post("/", submitLimiter, validateReport, createReport);

export default router;
