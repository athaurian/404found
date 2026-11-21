import { useState } from "react";

// Shows the image, or the fallback if the link is empty or broken.
export default function SafeImage({ src, alt, className, fallback }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return fallback;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}