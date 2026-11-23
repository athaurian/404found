import { v2 as cloudinary } from "cloudinary";

function parseCloudinaryUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "cloudinary:" || !url.hostname) {
      return null;
    }

    const apiKey = decodeURIComponent(url.username);
    const apiSecret = decodeURIComponent(url.password);

    if (!apiKey || !apiSecret) {
      return null;
    }

    return {
      cloud_name: url.hostname,
      api_key: apiKey,
      api_secret: apiSecret,
    };
  } catch {
    return null;
  }
}

/** Reads the Cloudinary settings from CLOUDINARY_URL or the three separate variables. */
export function readCloudinaryConfig() {
  if (process.env.CLOUDINARY_URL) {
    const parsed = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
    if (parsed) {
      return parsed;
    }
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    return { cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret };
  }

  return null;
}

export function getCloudinaryCloudName() {
  return readCloudinaryConfig()?.cloud_name ?? null;
}

export function getCloudinaryClient() {
  const config = readCloudinaryConfig();
  if (!config) {
    return null;
  }

  cloudinary.config({ ...config, secure: true });
  return cloudinary;
}
