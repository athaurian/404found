import { useState } from "react";

// Shows the image, or the fallback if the link is empty or broken.
export default function SafeImage({
  src,
  srcSet,
  sizes,
  alt,
  className,
  fallback,
  loading = "lazy",
  decoding = "async",
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return fallback;
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      onError={() => setFailed(true)}
    />
  );
}
