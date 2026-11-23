import { Router } from "express";
import {
  createReport,
  getReport,
  listReports,
} from "../controllers/reportController.js";
import { uploadReportImage } from "../controllers/uploadController.js";
import { submitLimiter } from "../middlewares/submitLimiter.js";
import { uploadImage } from "../middlewares/uploadImage.js";
import { validateReport } from "../middlewares/validateReport.js";

const router = Router();

router.get("/", listReports);
router.post("/upload", submitLimiter, uploadImage, uploadReportImage);
router.get("/:id", getReport);
router.post("/", submitLimiter, validateReport, createReport);

export default router;
