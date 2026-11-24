import { useEffect, useState } from "react";
import CategoryArt from "./CategoryArt";

/**
 * Shows a report photo. If there is no photo link, or the link is broken,
 * it shows the matching category illustration instead, so a report always
 * has an image.
 */
export default function SafeImage({
  src,
  srcSet,
  sizes,
  alt = "",
  category,
  className = "",
  loading = "lazy",
  decoding = "async",
  ...rest
}) {
  const [failed, setFailed] = useState(false);

  // A new link deserves a new chance to load
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return <CategoryArt category={category} />;
  }

  return (
    <img
      {...rest}
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
