import { getCloudinaryClient } from "../config/cloudinary.js";
import { HttpError } from "../middlewares/errorHandler.js";

function uploadBuffer(client, file) {
  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder: "404found",
        resource_type: "image",
        allowed_formats: ["jpg", "png", "webp"],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload failed", error);
          reject(new HttpError(502, "Image upload failed. Please try again."));
          return;
        }
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
}

export async function uploadReportImage(req, res, next) {
  try {
    if (!req.file) {
      throw new HttpError(400, "Image file is required");
    }

    const client = getCloudinaryClient();
    if (!client) {
      throw new HttpError(503, "Image upload is not configured");
    }

    const result = await uploadBuffer(client, req.file);
    if (!result?.secure_url) {
      throw new HttpError(502, "Image upload failed. Please try again.");
    }

    res.status(201).json({
      status: "success",
      message: "Image uploaded successfully",
      data: { imageUrl: result.secure_url },
    });
  } catch (err) {
    next(err);
  }
}
