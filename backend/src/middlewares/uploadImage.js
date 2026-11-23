import multer from "multer";
import { HttpError } from "./errorHandler.js";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(new HttpError(400, "Only JPG, PNG, or WebP images are allowed."));
      return;
    }
    callback(null, true);
  },
}).single("image");
