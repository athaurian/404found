const UPLOAD_MARKER = "/image/upload/";

export const CARD_IMAGE_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";

export function buildCloudinaryUrl(url, transform) {
  if (typeof url !== "string" || !url || !transform) return url;

  const index = url.indexOf(UPLOAD_MARKER);
  if (index === -1) return url;

  const head = url.slice(0, index + UPLOAD_MARKER.length);
  const tail = url.slice(index + UPLOAD_MARKER.length);
  if (!tail) return url;
  return `${head}${transform}/${tail}`;
}

export function getCardImageSources(url) {
  if (typeof url !== "string" || !url || !url.includes(UPLOAD_MARKER)) {
    return { src: url, srcSet: undefined };
  }

  const small = buildCloudinaryUrl(url, "c_fill,w_400,h_300,f_webp,q_70");
  const large = buildCloudinaryUrl(url, "c_fill,w_800,h_600,f_webp,q_70");
  return { src: small, srcSet: `${small} 400w, ${large} 800w` };
}
